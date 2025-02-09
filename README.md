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

3. **Test in Browser:** Open your browser and navigate to `http://127.0.0.1:8000`. You should see the default Django welcome page, confirming that your backend is set up correctly.

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

3. **Test in Browser:** Open your browser and navigate to `http://localhost:3000`. You should see the default Next.js homepage, confirming that your frontend application is set up correctly. 

4. Press `Ctrl+C` to stop the server.

