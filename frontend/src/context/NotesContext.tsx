"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Note {
  id: number;
  title: string;
  content: string;
  position: number;
}

export type { Note };

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string) => Promise<Note | null>;
  updateNote: (id: number, title: string, content: string) => Promise<Note | null>;
  deleteNote: (id: number) => Promise<void>;
  updatePositions: (updatedNotes: Note[]) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        try {
          const response = await fetch('/api/notes/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setNotes(data);
          }
        } catch (error) {
          console.error("Error loading notes:", error);
        }
      }
    }
    loadNotes();
  }, [user]);

  const addNote = useCallback(async (title: string, content: string) => {
    try {
      const response = await fetch('/api/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        return newNote;
      } else {
        console.error("Error adding note:", response.status);
        return null;
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      return null;
    }
  }, [notes]);

  const updateNote = useCallback(async (id: number, title: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
        return updatedNote;
      } else {
        console.error("Error updating note:", response.status);
        return null;
      }
    } catch (err) {
      console.error('Failed to update note:', err);
      return null;
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  }, [notes]);

  const updatePositions = useCallback(async (updatedNotes: Note[]) => {
    try {
      const response = await fetch('/api/notes/positions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updatedNotes.map((note) => ({ id: note.id, position: note.position }))),
      });
      if (response.ok) {
        setNotes(updatedNotes);
      }
    } catch (err) {
      console.error('Failed to update positions:', err);
    }
  }, [notes]);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, updatePositions }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
