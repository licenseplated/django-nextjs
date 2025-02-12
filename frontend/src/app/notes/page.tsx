"use client";

import { useNotes } from '@/context/NotesContext';
import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Note } from '@/context/NotesContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, updatePositions } = useNotes();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleAddNote = async () => {
    if (newTitle && newContent) {
      const newNote = await addNote(newTitle, newContent);
      if (newNote) {
        setNewTitle('');
        setNewContent('');
      }
    }
  };

  const moveNote = (dragIndex: number, hoverIndex: number) => {
    const draggedNote = notes[dragIndex];
    const updatedNotes = [...notes];
    updatedNotes.splice(dragIndex, 1);
    updatedNotes.splice(hoverIndex, 0, draggedNote);
    updatePositions(updatedNotes.map((note, index) => ({ ...note, position: index })));
  };

  const NoteCard = ({ note, index }: { note: Note; index: number }) => {
    const [, ref] = useDrag({
      type: 'NOTE',
      item: { index },
    });
    const [, drop] = useDrop({
      accept: 'NOTE',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveNote(item.index, index);
          item.index = index;
        }
      },
    });

    const [localEditingNote, setLocalEditingNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      if (editingNote?.id === note.id) {
        setLocalEditingNote({ ...note });
        setIsEditing(true);
      } else {
        setLocalEditingNote(null);
        setIsEditing(false);
      }
    }, [editingNote, note]);

    const handleLocalEditChange = (field: 'title' | 'content', value: string) => {
      if (localEditingNote) {
        setLocalEditingNote({ ...localEditingNote, [field]: value });
      }
    };

    const handleEditNote = async () => {
      if (localEditingNote) {
        const updatedNote = await updateNote(
          localEditingNote.id,
          localEditingNote.title,
          localEditingNote.content
        );
        if (updatedNote) {
          setEditingNote(null);
        }
      }
    };

    return (
      <div
        ref={(node) => {
          ref(node);
          drop(node);
        }}
        className="p-4 mb-2 bg-white rounded shadow"
        key={note.id}
      >
        {isEditing ? (
          <div>
            <input
              type="text"
              value={localEditingNote?.title || ""}
              onChange={(e) => handleLocalEditChange('title', e.target.value)}
              className="dark-text w-full p-2 mb-2 border rounded"
            />
            <textarea
              value={localEditingNote?.content || ""}
              onChange={(e) => handleLocalEditChange('content', e.target.value)}
              className="dark-text w-full p-2 mb-2 border rounded"
            />
            <button onClick={handleEditNote} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Save
            </button>
          </div>
        ) : (
          <div>
            <h2 className="dark-text text-xl font-bold">{note.title}</h2>
            <p className="dark-text">{note.content}</p>
            <button onClick={() => setEditingNote(note)} className="text-blue-500 hover:text-blue-700">
              Edit
            </button>
            <button onClick={() => deleteNote(note.id)} className="text-red-500 hover:text-red-700 ml-2">
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">My Notes</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Note Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded text-gray-800"
        />
        <textarea
          placeholder="Note Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-2 mb-2 border rounded text-gray-800"
        />
        <button onClick={handleAddNote} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Note
        </button>
      </div>

      <DndProvider backend={HTML5Backend}>
        {notes.map((note, index) => (
          <NoteCard key={note.id} note={note} index={index} />
        ))}
      </DndProvider>
    </main>
  );
}