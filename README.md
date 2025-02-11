# Django + Next.js

Welcome to the Django + Next.js demo project! This project demonstrates how to build a full-stack web application using a Django backend and a Next.js frontend. Both components will be containerized with Docker to ensure a consistent development environment and seamless deployment. Each step of the process will be documented in this README, complete with explanations and instructions.

## Table of Contents

1. [Set Up the Directory Structure](#step-1-set-up-the-directory-structure)
2. [Initialize the Django Backend](#step-2-initialize-the-django-backend)
3. [Initialize the Next.js Frontend](#step-3-initialize-the-nextjs-frontend)
4. [Containerization Setup](#step-4-containerization-setup)
   - [Backend Setup](#41-backend-setup)
   - [Frontend Setup](#42-frontend-setup)
   - [Docker Compose Setup](#43-docker-compose-setup)
   - [Build and Run](#44-build-and-run)
5. [Backend: Configure Django Admin Interface](#step-5-backend-configure-django-admin-interface)
   - [Create a Superuser](#51-create-a-superuser)
   - [Configure Admin Interface](#52-configure-admin-interface)
   - [Access Admin Interface](#53-access-admin-interface)
   - [Create Regular User Accounts](#54-create-regular-user-accounts)
6. [Backend: Add JWT Authentication](#step-6-backend-add-jwt-authentication)
   - [Update Dependencies](#61-update-dependencies)
   - [Update Django Settings](#62-update-django-settings)
   - [Add URL Patterns](#63-add-url-patterns)
   - [Testing the API Endpoints](#64-testing-the-api-endpoints)
7. [Frontend: Configure Landing Page](#step-7-frontend-configure-landing-page)
   - [Create Navigation Components](#71-create-navigation-components)
   - [Add Status Indicator](#72-add-status-indicator)
   - [Update Landing Page](#73-update-landing-page)
8. [Frontend: Add Authentication](#step-8-frontend-add-authentication)
   - [Create Auth Context](#81-create-auth-context)
   - [Create Login Page](#82-create-login-page)
   - [Update Navigation](#83-update-navigation)
   - [Add Protected Content](#84-add-protected-content)

Let's get started!

## Step 1: Set Up the Directory Structure

Create a directory structure that clearly separates the Django backend from the Next.js frontend. You can set it up as follows:

```bash
mkdir backend frontend
```

- The **backend** directory will house your Django project.
- The **frontend** directory will contain your Next.js application.

Once these directories are created, we will proceed to set up the individual projects in each.

## Step 2: Initialize the Django Backend

Before starting the Django project, it's a good practice to set up a Python virtual environment. This ensures all dependencies are isolated.

Navigate to the `backend` directory and execute the following commands:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate

# After activating the virtual environment, install Django:
pip install django

# Now, create a new Django project:
django-admin startproject backend .
```

This command will create a basic Django project named **backend** in the `backend` directory.

### Verify the Django Backend

To ensure that your Django backend is working properly, follow these steps:

1. **Run Migrations:** Configure your database by executing:
   ```bash
   python manage.py migrate
   ```

2. **Start the Development Server:** Launch the server with:
   ```bash
   python manage.py runserver
   ```

3. **Test in Browser:** Open your browser and navigate to [http://localhost:8000](http://localhost:8000). You should see the default Django welcome page, confirming that your backend is set up correctly.

4. Press `Ctrl+C` to stop the server.

## Step 3: Initialize the Next.js Frontend

Navigate to the `frontend` directory and create a new Next.js application. Run the following commands:

```bash
cd ../frontend
npx create-next-app@latest .
```

This command will generate a basic Next.js application in the `frontend` directory; the command will ask you several questions, here's how we're choosing to answer them:

```
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like your code inside a `src/` directory? Yes
✔ Would you like to use App Router? (recommended) Yes
✔ Would you like to use Turbopack for `next dev`? Yes
✔ Would you like to customize the import alias (`@/*` by default)? Yes
✔ What import alias would you like configured? @/*
```

### Verify the Next.js Frontend

Once the Next.js application is created, follow these steps to verify that your frontend is working:

1. **Install Dependencies:** If not automatically installed, run:
   ```bash
   npm install
   ```

2. **Start the Development Server:** Launch the server with:
   ```bash
   npm run dev
   ```

3. **Test in Browser:** Open your browser and navigate to [http://localhost:3000](http://localhost:3000). You should see the default Next.js homepage, confirming that your frontend application is set up correctly. 

4. Press `Ctrl+C` to stop the server.

## Step 4: Containerization Setup

### 4.1 Backend Setup

First, create a `setup.py` file in the backend directory to manage Python dependencies:

```bash
cd backend
touch setup.py
```

Add the following content to `setup.py`:
```python
from setuptools import setup, find_packages

setup(
    name="backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "django>=4.0.0",
        "gunicorn>=20.1.0",
        "whitenoise>=6.0.0",
    ],
)
```

Create a `Dockerfile` in the backend directory:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app/

RUN pip install -e .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000
# Use Django development server for hot reloading
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### 4.2 Frontend Setup

First, update `next.config.ts` to enable standalone output:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

Create a `Dockerfile` in the frontend directory:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy the static build output
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY --from=builder /app/.next/server/app /usr/share/nginx/html
COPY --from=builder /app/.next/server/pages /usr/share/nginx/html

# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create a `nginx.conf` file in the frontend directory:
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Proxy /api requests to Django backend
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy /admin requests to Django backend
    location /admin/ {
        proxy_pass http://backend:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy /static requests to Django backend
    location /static/ {
        proxy_pass http://backend:8000/static/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # DEV MODE: Proxy everything else to the Next.js development server
    location / {
        proxy_pass http://frontend-dev:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Docker Compose Setup

Create a `docker-compose.yml` file in the root directory:
```yaml
services:
  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000  # Override Dockerfile CMD for development
    ports:
      - "8000:8000"
    volumes:
      - static_volume:/app/staticfiles
      # Development volume for live code updates
      - ./backend:/app
      # Exclude the virtual environment directory
      - /app/venv
    environment:
      - DEBUG=1  # Enable Django debug mode
      - PYTHONDONTWRITEBYTECODE=1  # Don't write .pyc files
      - PYTHONUNBUFFERED=1  # Don't buffer Python output

  frontend-dev:
    image: node:18-alpine
    command: sh -c "npm install && npm run dev"
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - NEXT_WEBPACK_USEPOLLING=1
      - WATCHPACK_POLLING=true
      - NODE_ENV=development
    depends_on:
      - backend

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend-dev
    volumes:
      # Development volume for live code updates
      - ./frontend:/app
      # Exclude node_modules and .next
      - /app/node_modules
      - /app/.next

volumes:
  static_volume:
```

### 4.4 Build and Run

To build and start both services:
```bash
docker-compose up --build
```

Once running, you can access:
- Frontend at [http://localhost](http://localhost)
- Backend at [http://localhost:8000](http://localhost:8000)

## Step 5: Backend: Configure Django Admin Interface

### 5.1 Create a Superuser

First, we need to create a superuser account that can access the Django admin interface. Stop your Docker containers if they're running (`Ctrl+C`), then:

```bash
cd backend
source venv/bin/activate  # If not already activated
python manage.py createsuperuser
```

Follow the prompts to create your superuser account:
- Enter your desired username
- Enter your email address (optional)
- Create and confirm a strong password

### 5.2 Configure Admin Interface

Update `backend/backend/settings.py` to ensure the admin interface and static files are properly configured:

```python
import os  # Add this at the top of the file

INSTALLED_APPS = [
    'django.contrib.admin',  # Make sure this is present
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# Make sure these middleware are present
MIDDLEWARE = [
    'django.contrib.sessions.middleware.SessionMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # ... other middleware ...
]

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 5.3 Access Admin Interface

1. Start your Docker containers:
   ```bash
   docker-compose up --build
   ```

2. Navigate to [http://localhost:8000/admin](http://localhost:8000/admin)
3. Log in with your superuser credentials

### 5.4 Create Regular User Accounts

To create regular user accounts through the admin interface:

1. Click on "Users" under the "Authentication and Authorization" section
2. Click the "Add User" button in the top right corner
3. Fill in the required information:
   - Username (required)
   - Password (will be set twice)
4. Click "Save" to create the basic user
5. On the next screen, you can optionally add:
   - Personal info (first name, last name, email)
   - Permission settings
   - Group memberships
6. Click "Save" again to update the user's details

You can now use these accounts to test your application's authentication features.

## Step 6: Backend: Add JWT Authentication

We'll use `djangorestframework` and `djangorestframework-simplejwt` to handle JWT authentication.

### 6.1 Update Dependencies

First, update `backend/setup.py` to include the new dependencies:
```python
from setuptools import setup, find_packages

setup(
    name="backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "django>=4.0.0",
        "gunicorn>=20.1.0",
        "whitenoise>=6.0.0",
        "djangorestframework>=3.14.0",
        "djangorestframework-simplejwt>=5.3.0",
    ],
)
```

### 6.2 Update Django Settings

Update `backend/backend/settings.py` to include REST framework and JWT settings:
```python
INSTALLED_APPS = [
    # ... existing apps ...
    'rest_framework',
    'rest_framework_simplejwt',
]

# Add REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Add JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

### 6.3 Add URL Patterns

First, create `backend/backend/views.py`:
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def status_view(request):
    return Response({"status": "ok"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response({
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    })
```

Update `backend/backend/urls.py`:
```python
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import status_view, me_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/status/', status_view, name='api-status'),
    path('api/me/', me_view, name='api-me'),
]
```

### 6.4 Testing the API Endpoints

> **Note:** The examples below use `jq` for JSON parsing. If you don't have it installed, you can install it with:
> ```bash
> # On Ubuntu/Debian
> sudo apt-get install jq
> 
> # On macOS with Homebrew
> brew install jq
> ```

1. Rebuild the containers to include the new dependencies:
   ```bash
   docker-compose down && docker-compose up --build
   ```

2. Test the status endpoint (no authentication required):
   ```bash
   curl http://localhost/api/status/
   ```

   Expected response:
   ```json
   {"status": "ok"}
   ```

3. Try to access the me endpoint without authentication (should fail):
   ```bash
   curl http://localhost/api/me/
   ```

4. Get authentication tokens (replace with your credentials):
   ```bash
   # First, see the full response
   curl -X POST http://localhost/api/token/ \
       -H "Content-Type: application/json" \
       -d '{"username": "your_username", "password": "your_password"}'
   
   # Then, extract tokens into variables (requires jq)
   ACCESS_TOKEN=$(curl -s -X POST http://localhost/api/token/ \
       -H "Content-Type: application/json" \
       -d '{"username": "your_username", "password": "your_password"}' \
       | jq -r .access)
   
   REFRESH_TOKEN=$(curl -s -X POST http://localhost/api/token/ \
       -H "Content-Type: application/json" \
       -d '{"username": "your_username", "password": "your_password"}' \
       | jq -r .refresh)
   ```

5. Test the me endpoint with authentication:
   ```bash
   curl -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost/api/me/
   ```

   Expected response:
   ```json
   {
       "username": "your_username",
       "first_name": "Your",
       "last_name": "Name",
       "email": "your.email@example.com"
   }
   ```

6. Refresh the access token using the refresh token:
   ```bash
   # Get a new access token
   NEW_ACCESS_TOKEN=$(curl -s -X POST http://localhost/api/token/refresh/ \
       -H "Content-Type: application/json" \
       -d "{\"refresh\": \"$REFRESH_TOKEN\"}" \
       | jq -r .access)
   
   # Test the new access token
   curl -H "Authorization: Bearer $NEW_ACCESS_TOKEN" http://localhost/api/me/
   ```

## Step 7: Frontend: Configure Landing Page

### 7.1 Create Navigation Components

First, create a new components directory and navigation component:

```bash
mkdir -p frontend/src/components
```

Create `frontend/src/components/Navigation.tsx`:
```typescript
"use client"

import { FC } from 'react'
import Link from 'next/link'
import StatusIndicator from './StatusIndicator'

const Navigation: FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-800 hover:text-gray-600">
          Home
        </Link>
      </div>
      
      <StatusIndicator />
      
      <div>
        <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Login
        </button>
      </div>
    </nav>
  )
}

export default Navigation
```

### 7.2 Add Status Indicator

Create `frontend/src/components/StatusIndicator.tsx`:
```typescript
"use client"

import { FC, useEffect, useState } from 'react'

const StatusIndicator: FC = () => {
  const [status, setStatus] = useState<'ok' | 'error'>('error')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status')
        const data = await response.json()
        setStatus(data.status === 'ok' ? 'ok' : 'error')
      } catch (err) {
        console.error('Failed to fetch status:', err)
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'ok' ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {status === 'ok' ? 'System Online' : 'System Offline'}
      </span>
    </div>
  )
}

export default StatusIndicator
```

### 7.3 Update Landing Page

Update `frontend/src/app/page.tsx`:
```typescript
"use client"

import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-5xl font-bold text-gray-800 text-center">
          Django/NextJS Demo App
        </h1>
      </div>
    </main>
  )
}
```

These changes will:
- Create a clean navigation bar with Home link, status indicator, and login button
- Add a status indicator that polls the backend every 30 seconds
- Center the app title on the page
- Use Tailwind CSS for styling (which we selected during Next.js setup)

After making these changes, rebuild your frontend container:
```bash
docker-compose up --build frontend
```

## Step 8: Frontend: Add Authentication

### 8.1 Create Auth Context

First, create new context and login page directory:

```bash
mkdir -p frontend/src/context frontend/src/app/login
```

Create `frontend/src/context/AuthContext.tsx`:
```typescript
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if we have tokens and fetch user data if we do
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await fetch('/api/me/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err)
        }
      }
    }
    
    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        
        // Fetch user data
        const userResponse = await fetch('/api/me/', {
          headers: {
            'Authorization': `Bearer ${data.access}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          setError(null)
          router.push('/')
        }
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred during login')
      console.error('Login error:', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 8.2 Create Login Page

Create `frontend/src/app/login/page.tsx`:
```typescript
"use client"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  )
}
```

### 8.3 Update Navigation

Update `frontend/src/components/Navigation.tsx`:
```typescript
"use client"

import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusIndicator from './StatusIndicator'
import { useAuth } from '@/context/AuthContext'

const Navigation: FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-800 hover:text-gray-600">
          Home
        </Link>
      </div>
      
      <StatusIndicator />
      
      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navigation
```

### 8.4 Add Protected Content

Update `frontend/src/app/layout.tsx` to wrap the app with AuthProvider:
```typescript
import { AuthProvider } from '@/context/AuthContext'
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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

These changes will:
- Add authentication state management using React Context
- Create a login page with error handling
- Update the navigation to show user info when logged in
- Persist authentication state using localStorage
- Handle token storage and user data fetching

After making these changes, rebuild your frontend container:
```bash
docker-compose up -d --build frontend
```

