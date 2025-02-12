"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface Note {
  id: number
  title: string
  content: string
  position: number
}

export type { Note }

interface NotesContextType {
  notes: Note[]
  fetchNotes: () => void
  addNote: (title: string, content: string) => Promise<void>
  updateNote: (id: number, title: string, content: string) => Promise<void>
  deleteNote: (id: number) => Promise<void>
  updatePositions: (updatedNotes: Note[]) => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    }
  }

  const addNote = async (title: string, content: string) => {
    try {
      const response = await fetch('/api/notes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ title, content })
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  const updateNote = async (id: number, title: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ title, content })
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  const deleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const updatePositions = async (updatedNotes: Note[]) => {
    try {
      const response = await fetch('/api/notes/positions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedNotes.map(note => ({ id: note.id, position: note.position })))
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Failed to update positions:', err)
    }
  }

  return (
    <NotesContext.Provider value={{ notes, fetchNotes, addNote, updateNote, deleteNote, updatePositions }}>
      {children}
    </NotesContext.Provider>
  )
}

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
