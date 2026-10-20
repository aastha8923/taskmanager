# TaskFlow – Project & Task Management System

A web-based Project and Task Management System built using React, Spring Boot, Spring Security, JWT authentication, and MySQL.

## Features

- User registration and login with JWT authentication
- Role-based access control for Admin and User
- Project creation, viewing, updating, and deletion
- Task creation, viewing, updating, and deletion
- Task assignment to users
- Task status and priority management
- Task status history tracking
- Dashboard displaying project and task statistics
- Users can view assigned tasks and update their status
- Admin-only project and task management operations

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS

### Backend
- Java 17
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA / Hibernate
- Maven

### Database
- MySQL

## Project Structure

- `frontend/` – React frontend application
- `src/main/java/` – Spring Boot backend source code
- `src/main/resources/` – Backend configuration

## Prerequisites

- Java 17
- Node.js and npm
- MySQL Server
- IntelliJ IDEA or another Java IDE
- Maven, or the included Maven wrapper

## Setup and Run

### 1. Configure the database

Create a MySQL database named `task_manager`.

Configure your database connection and credentials using the backend's `application.properties` file and environment variables.

Required environment variables:

- `DB_PASSWORD` – MySQL password
- `JWT_SECRET` – JWT signing secret
- `ADMIN_EMAIL` – Initial Admin email
- `ADMIN_PASSWORD` – Initial Admin password

Keep actual passwords and secrets out of source control.

### 2. Run the backend

Open the Spring Boot project in IntelliJ IDEA.

Configure the required environment variables in the run configuration and run the main Spring Boot application.

The backend runs at:

`http://localhost:8080`

### 3. Run the frontend

Open a terminal in the `frontend` directory and run:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, usually:

`http://localhost:5173`

## API Overview

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/projects` | Retrieve projects |
| POST | `/projects` | Create a project |
| PUT | `/projects/{id}` | Update a project |
| DELETE | `/projects/{id}` | Delete a project |
| GET | `/tasks` | Retrieve accessible tasks |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/{id}/assign?assignedUserId={userId}` | Assign a task |
| PATCH | `/tasks/{id}/status?status={status}` | Update task status |
| GET | `/tasks/{id}/history` | View task status history |
| DELETE | `/tasks/{id}` | Delete a task |

Protected endpoints require a valid JWT Bearer token. Administrative operations require the Admin role.

## Running Notes

- Ensure MySQL is running before starting the backend.
- Configure all required environment variables before launching the application.
- Start the backend before using the frontend.
- Do not commit passwords, signing secrets, or other sensitive credentials.
