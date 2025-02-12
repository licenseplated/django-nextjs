"use client"

import { useNotes } from '@/context/NotesContext'
import { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Note } from '@/context/NotesContext'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, updatePositions } = useNotes()
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('user', user)
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const handleAddNote = async () => {
    if (newTitle && newContent) {
      await addNote(newTitle, newContent)
      setNewTitle('')
      setNewContent('')
    }
  }

  const handleEditNote = async () => {
    if (editingNote) {
      await updateNote(editingNote.id, editingNote.title, editingNote.content)
      setEditingNote(null)
    }
  }

  const moveNote = (dragIndex: number, hoverIndex: number) => {
    const draggedNote = notes[dragIndex]
    const updatedNotes = [...notes]
    updatedNotes.splice(dragIndex, 1)
    updatedNotes.splice(hoverIndex, 0, draggedNote)
    updatePositions(updatedNotes.map((note, index) => ({ ...note, position: index })))
  }

  const NoteCard = ({ note, index }: { note: Note; index: number }) => {
    const [, ref] = useDrag({
      type: 'NOTE',
      item: { index },
    })
    const [, drop] = useDrop({
      accept: 'NOTE',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveNote(item.index, index)
          item.index = index
        }
      },
    })
    return (
      <div ref={(node) => { ref(node); drop(node); }} className="p-4 mb-2 bg-white rounded shadow">
        {editingNote?.id === note.id ? (
          <div>
            <input
              type="text"
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={handleEditNote}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold">{note.title}</h2>
            <p>{note.content}</p>
            <button
              onClick={() => setEditingNote(note)}
              className="text-blue-500 hover:text-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">My Notes</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Note Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          placeholder="Note Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleAddNote}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Note
        </button>
      </div>

      <DndProvider backend={HTML5Backend}>
        {notes.map((note, index) => (
          <NoteCard key={note.id} note={note} index={index} />
        ))}
      </DndProvider>
    </main>
  )
}
