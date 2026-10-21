# TaskFlow – Project & Task Management System

## Overview

TaskFlow is a web-based Project and Task Management System built with React, Spring Boot, Spring Security, JWT authentication, and MySQL. It supports role-based access for administrators and regular users, task assignment, task status updates, and activity tracking.

## Features

### Authentication and Authorization
- User registration and login using JWT authentication.
- Passwords are hashed using BCrypt.
- Role-based access for `ADMIN` and `USER`.
- Administrative endpoints are restricted to Admin users.
- Regular users can view their assigned tasks and update task status, subject to backend authorization rules.

### Project Management
- Create, view, update, and delete projects, with administrative operations restricted to Admin users.
- Associate tasks with projects.

### Task Management
- Create, view, update, and delete tasks, with administrative operations restricted to Admin users.
- Assign tasks to users.
- Set task priority and due dates.
- Update task status using the following supported statuses:
   - `TODO`
   - `IN_PROGRESS`
   - `COMPLETED`
   - `BLOCKED`
- View task status history.
- View assignee-change activity history.
- Retrieve tasks visible to the signed-in user.

### Dashboard and Filtering
- Dashboard task statistics and filtering where implemented in the current frontend.
- Project, user, status, and date filtering where supported by the current implementation.
- Verify the current dashboard calculations and filters before describing them as fully supported in a demonstration.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Java 17, Spring Boot, Spring Security |
| Authentication | JWT, BCrypt |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL |
| Build Tool | Maven |
| API Testing | Postman |

## Project Structure

```text
taskmanager/
├── src/
│   └── main/
│       ├── java/                 # Spring Boot source code
│       └── resources/            # Application configuration
├── frontend/                     # React + Vite application
├── database/
│   └── schema.sql                # Creates the task_manager database
├── postman/
│   └── TaskManager.postman_collection.json
├── pom.xml
└── README.md
```

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 17
- Maven, or the Maven wrapper if included
- Node.js and npm
- MySQL Server
- IntelliJ IDEA or another Java IDE
- Postman (optional, for API testing)

## Configuration and Setup

### 1. Create the Database

Start MySQL and run the database setup script from the repository root.

Using the MySQL command line:

```bash
mysql -u root -p < database/schema.sql
```

Alternatively, open `database/schema.sql` in MySQL Workbench and execute it.

The script creates the `task_manager` database. The application's JPA entities define the tables. Check `spring.jpa.hibernate.ddl-auto` in `src/main/resources/application.properties`:

- With `update` or `create`, Hibernate can create or update tables from the entities at startup. The `create` setting may recreate tables and should be used carefully.
- With `validate` or `none`, tables must already exist and match the entity mappings.

Do not use `create` against a database containing data you need to preserve.

### 2. Configure Environment Variables

Set the environment variables used by your backend in your IDE run configuration or local environment:

```text
DB_PASSWORD=your_local_mysql_password
JWT_SECRET=your_long_random_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_strong_local_password
```

Set the database username variable as well if your application configuration expects one, such as `DB_USERNAME`.

**Security:** Never commit real passwords, JWT secrets, or production credentials to GitHub. Keep local secrets out of `application.properties` and screenshots.

### 3. Run the Backend

1. Open the repository in IntelliJ IDEA.
2. Make sure the project uses JDK 17.
3. Confirm MySQL is running and the `task_manager` database exists.
4. Configure the required environment variables in the Spring Boot run configuration.
5. Run the Spring Boot application.

The backend is expected to be available at:

```text
http://localhost:8080
```

If startup fails, check the console for database connection errors, missing environment variables, port conflicts, or JPA schema-validation errors.

### 4. Run the Frontend

Open a terminal in the `frontend` directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

Keep the backend and frontend running while testing the application.

## Authentication and Roles

- **Admin:** Can perform administrative project and task operations and access the user list for assignment, where enabled.
- **User:** Can view assigned tasks and update their status according to backend authorization rules.
- Protected API requests use the JWT returned by the login endpoint.

For protected requests, include the token in the HTTP `Authorization` header:

```text
Authorization: Bearer <JWT_TOKEN>
```

The exact login and registration request and response fields are defined by the authentication controller.

## API Overview

Base URL:

```text
http://localhost:8080/api
```

The following is a high-level endpoint guide. Confirm controller mappings and request fields in the source code before using these examples.

| Method | Endpoint | Purpose / Access |
|---|---|---|
| `POST` | `/auth/register` | Register a user, if enabled as a public endpoint |
| `POST` | `/auth/login` | Log in and obtain a JWT |
| `GET` | `/projects` | Retrieve projects |
| `POST` | `/projects` | Create a project; Admin |
| `PUT` | `/projects/{id}` | Update a project; Admin |
| `DELETE` | `/projects/{id}` | Delete a project; Admin |
| `GET` | `/tasks` | Retrieve tasks visible to the signed-in user |
| `POST` | `/tasks?projectId={projectId}` | Create a task; Admin. `assignedUserId` may be supplied as an optional query parameter |
| `PUT` | `/tasks/{id}` | Update a task; Admin |
| `PATCH` | `/tasks/{id}/assign?assignedUserId={userId}` | Assign a task; Admin |
| `PATCH` | `/tasks/{id}/status?status={status}` | Update task status, subject to authorization |
| `GET` | `/tasks/{id}/history` | Retrieve task status history |
| `GET` | `/tasks/{id}/activity-history` | Retrieve assignee-change activity history |
| `GET` | `/users` | Retrieve users for assignment; Admin |
| `DELETE` | `/tasks/{id}` | Delete a task; Admin |

Use existing IDs when testing endpoints that require `{id}`, `{projectId}`, or `{userId}`. Accepted JSON fields and validation constraints depend on the project's controllers and entity or DTO definitions.

## Testing with Postman

A starter collection is provided at:

```text
postman/TaskManager.postman_collection.json
```

1. Start MySQL, the backend, and the frontend if needed.
2. Open Postman and import the collection JSON file.
3. Set the collection variable `baseUrl` to `http://localhost:8080`.
4. Log in using a valid account.
5. Copy the JWT from the login response into the collection variable `token`.
6. Test requests in a sensible order: login, create or list a project, create or list a task, update task status, and inspect history.
7. Replace sample IDs and example request bodies with values that match your database and controller definitions.

The collection contains starter examples. Check request bodies and authorization behavior against the actual source code before using it as proof that every endpoint works.

## Database Notes

- Database name: `task_manager`
- Database creation script: `database/schema.sql`
- Entity table definitions are managed by the JPA/Hibernate configuration unless a complete schema is supplied separately.
- Keep a local database backup if you have data you need to preserve.

## Error Handling and Validation

The backend should return appropriate HTTP error responses for invalid input, missing resources, unauthenticated requests, and unauthorized operations, according to the exception handling and validation implemented in the project. Test these cases before submission and update this section if the actual behavior differs.

## Security Notes

- Passwords are hashed using BCrypt.
- JWT is used for authenticated API access.
- Role restrictions are applied to administrative operations.
- Local secrets should be supplied through environment variables and must not be committed.
- Task-level access should be checked on individual-task and history endpoints, not only on the main task list.

## Pre-Submission Checklist

- [ ] The backend starts successfully using Java 17.
- [ ] MySQL connects and the required tables exist.
- [ ] An Admin can log in and perform permitted project and task operations.
- [ ] A regular user can access only tasks permitted by the backend rules.
- [ ] Task status changes are saved and appear in status history.
- [ ] Assignee changes are saved and appear in activity history.
- [ ] Due dates, overdue indicators, dashboard statistics, and filters behave as expected, if included in the current build.
- [ ] Postman request bodies and IDs have been adjusted to the actual API.
- [ ] No passwords, tokens, or other secrets are committed to the repository.
- [ ] The latest source code and documentation have been pushed to GitHub.

## Author

**Aastha Sharma**

Project: TaskFlow – Project & Task Management System
