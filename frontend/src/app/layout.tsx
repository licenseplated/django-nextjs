import { AuthProvider } from '@/context/AuthContext'
import { NotesProvider } from '@/context/NotesContext'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotesProvider>
            {children}
          </NotesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
