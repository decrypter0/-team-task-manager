# Team Task Manager

A full-stack web app for creating projects, assigning tasks, and tracking progress with role-based access (Admin/Member).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router
- **Deployment:** Railway (two services: server + client)

## Features

- Signup/Login with JWT authentication
- Roles: Admin and Member
  - Admins can create projects, add members, create/assign/edit/delete tasks
  - Members can view their projects and update the status of tasks assigned to them
- Project management: create projects, add team members
- Task management: create tasks, assign to members, set due dates, track status (To Do / In Progress / Done)
- Personal dashboard: shows all tasks assigned to the logged-in user, grouped by status, with overdue tasks flagged

## Project Structure

```
team-task-manager/
├── server/        # Express API
│   └── src/
│       ├── models/      # User, Project, Task (Mongoose schemas)
│       ├── routes/      # auth, projects, tasks, users
│       ├── middleware/  # JWT auth + role check
│       └── config/      # DB connection
└── client/        # React app (Vite)
    └── src/
        ├── pages/      # Login, Signup, Projects, ProjectDetail, Dashboard
        ├── components/ # Navbar, ProtectedRoute
        ├── context/    # AuthContext (logged-in user state)
        └── api.js      # central fetch helper
```

## Running Locally

### Backend
```
cd server
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```
Server runs on http://localhost:5000

### Frontend
```
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev
```
Frontend runs on http://localhost:5173

## Deployment (Railway)

This repo deploys as **two separate Railway services** from the same repo:

1. **Backend service** — root directory `server/`
   - Env vars: `MONGO_URI`, `JWT_SECRET`, `PORT` (Railway sets PORT automatically)
   - Uses MongoDB Atlas (free tier) as the database
2. **Frontend service** — root directory `client/`
   - Build command: `npm install && npm run build`
   - Start command: `npm start` (serves the Vite build via a small Express static server)
   - Env var: `VITE_API_URL` = the deployed backend's public URL

### Steps
1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster (free tier), get the connection string, allow access from anywhere (0.0.0.0/0) for Railway.
3. In Railway, create a new project, add the backend as a service pointing at `server/`, set env vars.
4. Deploy backend, copy its public URL.
5. Add the frontend as a second service pointing at `client/`, set `VITE_API_URL` to the backend's URL.
6. Deploy frontend, test the live app end to end.

## Role-Based Access Summary

| Action                     | Admin | Member |
|----------------------------|-------|--------|
| Create project              | Yes   | No     |
| Add members to project      | Yes   | No     |
| Create task                 | Yes   | No     |
| Assign task                 | Yes   | No     |
| Edit any task field         | Yes   | No     |
| Update status of own task   | Yes   | Yes    |
| Delete task                 | Yes   | No     |
| View own dashboard          | Yes   | Yes    |

## Notes

- Passwords are hashed with bcrypt before storage; raw passwords are never stored or logged.
- JWT tokens expire after 7 days.
- "Overdue" is computed dynamically (due date in the past and status not "done"), not stored as a separate field.
