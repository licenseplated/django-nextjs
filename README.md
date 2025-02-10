# Django + Next.js

Welcome to the Django + Next.js demo project! This project demonstrates how to build a full-stack web application using a Django backend and a Next.js frontend. Both components will be containerized with Docker to ensure a consistent development environment and seamless deployment. Each step of the process will be documented in this README, complete with explanations and instructions.

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
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]
```

### 4.2 Frontend Setup

First, update `next.config.ts` to enable standalone output:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  }
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
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri.html $uri/index.html /app/index.html /index.html;
    }

    location /_next/static {
        alias /usr/share/nginx/html/_next/static;
        expires 365d;
        access_log off;
    }

    location /public {
        alias /usr/share/nginx/html/public;
        expires 365d;
        access_log off;
    }
}
```

### 4.3 Docker Compose Setup

Create a `docker-compose.yml` file in the root directory:
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - static_volume:/app/staticfiles
      # Development volume for live code updates
      - ./backend:/app
      # Exclude the virtual environment directory
      - /app/venv

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
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

## Step 5: Configure Django Admin Interface

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

## Step 6: Add JWT Authentication

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

Update `backend/backend/urls.py`:
```python
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### 6.4 Test the JWT Endpoints

1. Rebuild the containers to include the new dependencies:
   ```bash
   docker-compose down && docker-compose up --build
   ```

2. Get a token pair by sending a POST request to `/api/token/`:
   ```bash
   curl -X POST http://localhost:8000/api/token/ \
       -H "Content-Type: application/json" \
       -d '{"username": "your_username", "password": "your_password"}'
   ```

3. You should receive a response like:
   ```json
   {
       "access": "your.access.token",
       "refresh": "your.refresh.token"
   }
   ```

4. To get a new access token using the refresh token:
   ```bash
   curl -X POST http://localhost:8000/api/token/refresh/ \
       -H "Content-Type: application/json" \
       -d '{"refresh": "your.refresh.token"}'
   ```

The access token can now be used in subsequent requests by including it in the Authorization header:
```bash
curl -H "Authorization: Bearer your.access.token" http://localhost:8000/your-protected-endpoint/
```