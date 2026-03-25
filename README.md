# TaskMaster API

- A RESTful API for managing projects and tasks, built with Node.js, Express, MongoDB, and JWT authentication.
- All tests passed

## Setup
1. Clone the repo and run 'npm install'
2. Create a '.env' file:
- PORT=3001
- MONGO_URI=mongodb+srv://equalizer0001_db_user:Password123@cluster0.x2q57bx.mongodb.net/?appName=Cluster0
- JWT_SECRET=your_jwt_secret
3. Run 'node server.js'

## API Endpoints

### Users (Public)
- POST /api/users/register - Register a new user
- POST /api/users/login - Login and receive JWT token

### Projects (Protected)
- POST /api/projects - Create a project
- GET /api/projects - Get all my projects
- GET /api/projects/:id - Get a single project
- PUT /api/projects/:id - Update a project
- DELETE /api/projects/:id - Delete a project

### Tasks (Protected)
- POST /api/projects/:projectId/tasks - Create a task
- GET /api/projects/:projectId/tasks - Get all tasks for a project
- PUT /api/tasks/:taskId - Update a task
- DELETE /api/tasks/:taskId - Delete a task

## Security
- Protected routes require a Bearer token in the Authorization header
- Users can only access their own data (403 if unauthorized)
- Passwords are hashed with bcrypt