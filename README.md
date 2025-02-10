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
    ],
)
```

Create a `Dockerfile` in the backend directory:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app/

RUN pip install -e .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
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

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 4.4 Build and Run

To build and start both services:
```bash
docker-compose up --build
```

Once running, you can access:
- Frontend at [http://localhost](http://localhost)
- Backend at [http://localhost:8000](http://localhost:8000)