# TaskFlow – Project & Task Management System

## Overview

TaskFlow is a web-based Project and Task Management System developed using React, Spring Boot, Spring Security, JWT authentication, and MySQL. It supports role-based access for administrators and regular users.

## Features

- User registration and login with JWT authentication
- Role-based access control for Admin and User roles
- Create, view, update, and delete projects
- Create, view, update, and delete tasks
- Assign tasks to users
- Update task status and priority
- Maintain task status history
- Dashboard displaying task statistics
- Restrict regular users to viewing their assigned tasks and updating their status
- Restrict administrative operations to Admin users

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- CSS

**Backend**
- Java 17
- Spring Boot
- Spring Security
- JWT authentication
- Spring Data JPA and Hibernate
- Maven

**Database**
- MySQL

## Project Structure

- `src/main/java/` – Spring Boot backend source code
- `src/main/resources/` – Backend configuration
- `frontend/` – React frontend application
- `pom.xml` – Maven dependencies and build configuration

## Prerequisites

- Java 17
- Node.js and npm
- MySQL Server
- IntelliJ IDEA or another Java IDE

## Setup and Run

### 1. Configure the Database

Create a MySQL database named `task_manager`.

Configure the database credentials using environment variables. Do not commit actual passwords or secret keys to the repository.

Required environment variables:

- `DB_PASSWORD`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Set these variables in your local run configuration before starting the backend.

### 2. Run the Backend

1. Open the project in IntelliJ IDEA.
2. Configure the required environment variables.
3. Run the Spring Boot application.
4. The backend will be available at:

   `http://localhost:8080`

### 3. Run the Frontend

Open a terminal in the `frontend` directory and run:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, normally:

`http://localhost:5173`

## API Overview

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
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
| GET | `/tasks/{id}/history` | Retrieve task status history |
| DELETE | `/tasks/{id}` | Delete a task |

Administrative endpoints require an authenticated Admin account. Authenticated requests use a Bearer JWT token where required.

## Security Notes

- Passwords are stored using BCrypt hashing.
- JWT authentication is used to secure protected endpoints.
- Role-based authorization restricts administrative operations.
- Database credentials, JWT secrets, and administrator credentials must be configured locally and must not be committed to version control.
