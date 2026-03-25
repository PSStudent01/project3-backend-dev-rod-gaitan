// Tasks API - Task Routes

const express = require('express');  // Imports express so we can use the Router feature
const router = express.Router();  // creates a mini router for task-related routes
const Task = require('../../models/Task'); // Imports the 'Task' model so we can talk to the 'tasks' collection
const Project = require('../../models/Project'); // Imports the 'Project' model so we can verify project ownership
const { protect } = require('../../utils/auth'); // Imports ONLY the 'protect' middleware from 'auth.js'
                                                // - 'protect' is needed because ALL task routes require authentication


// POST /api/projects/:projectId/tasks - Creates a new task for a specific project
router.post('/projects/:projectId/tasks', protect, async (req, res) => { // POST route at '/projects/:projectId/tasks'
                                                                          // ':projectId' is a URL parameter ITC a placeholder for the actual project ID
                                                                          // in 'server.js' it's mounted at '/api'
                                                                          // so the full path becomes POST /api/projects/:projectId/tasks
                                                                          // 'protect' runs FIRST to check the token before anything else can happen
  try {
    const project = await Project.findById(req.params.projectId); // Searches for the parent project by its ID from the URL
                                                                   // We need to find it BEFORE creating the task to verify ownership

    if (!project) { // IF no project is found with the requested ID...
      return res.status(404).json({ message: 'Project not found' }); // THEN sends back a '404 = not found' message
    }

    // Ownership check — verify the logged-in user owns this project
    if (project.user.toString() !== req.user._id.toString()) { // 'project.user' = the ID of who owns this project (stored in database)
                                                                // 'req.user._id' = the ID of who is making this request (from token)
                                                                // '.toString()' converts both IDs to strings so we can compare them
                                                                // IF they DON'T match, this user doesn't own this project....
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' }); // ...THEN returns 403 = Forbidden
    }

    const task = await Task.create({
      ...req.body,                        // the SPREAD operator spreads everything the user sent in the request body
                                          // for example if they sent { title: "My Task", description: "Do this" }
                                          // it spreads those fields into the new task document
      project: req.params.projectId       // this links the task to its parent project using the ID from the URL
                                          // This is how we know WHICH project this task belongs to
    });

    res.status(201).json(task); // Returns a 201 (created) code with the new task
  } catch (error) { // Logs this error message to the server terminal, if the 'try' block fails technically
    res.status(500).json({ message: error.message }); // 500 = internal server error
  }
});


// GET /api/projects/:projectId/tasks - Get all tasks for a specific project
router.get('/projects/:projectId/tasks', protect, async (req, res) => { // GET route at '/projects/:projectId/tasks'
                                                                          // returns ALL tasks belonging to a specific project
  try { // try to attempt this code, but if somthing goes technaically wrong, jump to 'catch' to throw the proper error and don't crash"
    const project = await Project.findById(req.params.projectId); // Searches for the parent project first to verify it exists and check ownership

    if (!project) { // IF no project is found with the requested ID...
      return res.status(404).json({ message: 'Project not found' }); // THEN sends back a '404 = not found' message
    }

    // Ownership check — verify the logged-in user owns this project
    if (project.user.toString() !== req.user._id.toString()) { // 'project.user' = the ID of who owns this project (stored in database)
                                                                // 'req.user._id' = the ID of who is making this request (from token)
                                                                // IF they DON'T match, this user doesn't own this project....
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' }); // ...THEN returns 403 = Forbidden
    }

    const tasks = await Task.find({ project: req.params.projectId }); // 'Task.find()' searches the database
                                                                        // '{ project: req.params.projectId }' filters results to ONLY tasks
                                                                        // where the 'project' field matches the projectId from the URL
    res.status(200).json(tasks); // 200 = success, sends back the array of tasks
  } catch (error) { // Logs this error message to the server terminal, if the 'try' block fails technically
    res.status(500).json({ message: error.message }); // 500 = internal server error
  }
});


// PUT /api/tasks/:taskId - Update a single task
router.put('/tasks/:taskId', protect, async (req, res) => { // PUT route at '/tasks/:taskId'
                                                             // ':taskId' is a URL parameter — a placeholder for the actual task ID
                                                             // full path becomes PUT /api/tasks/:taskId
  try {
    const task = await Task.findById(req.params.taskId); // Step 1: Find the task by its ID from the URL

    if (!task) { // IF no task is found with the requested ID...
      return res.status(404).json({ message: 'Task not found' }); // THEN sends back a '404 = not found' message
    }

    const project = await Project.findById(task.project); // Step 2: From the task, find its PARENT project
                                                           // 'task.project' holds the parent project's ID (set when task was created)
                                                           // We need the project to check WHO owns it

    if (!project) { // IF the parent project no longer exists...
      return res.status(404).json({ message: 'Parent project not found' }); // THEN sends back a '404 = not found' message
    }

    // Step 3: Ownership check — verify the logged-in user owns the PARENT project
    if (project.user.toString() !== req.user._id.toString()) { // 'project.user' = the ID of who owns the parent project
                                                                // 'req.user._id' = the ID of who is making this request (from token)
                                                                // IF they DON'T match, this user doesn't own the parent project....
      return res.status(403).json({ message: 'Not authorized to update this task' }); // ...THEN returns 403 = Forbidden
    }

    const updatedTask = await Task.findByIdAndUpdate( // 'findByIdAndUpdate()' finds and updates in one operation
      req.params.taskId, // tells you which task to update
      req.body,          // tells you what to update it with (from request body)
      { new: true }      // ensures it returns the UPDATED version, not the old one
    );

    res.status(200).json(updatedTask); // 200 = Ok, returns the updated task
  } catch (error) { // Logs this error message to the server terminal, if the 'try' block fails technically
    res.status(500).json({ message: error.message }); // 500 = internal server error
  }
});


// DELETE /api/tasks/:taskId - Delete a single task
router.delete('/tasks/:taskId', protect, async (req, res) => { // SAME 3-STEP AUTH LOGIC AS PUT ABOVE, EXCEPT THIS DELETES THE TASK
  try {
    const task = await Task.findById(req.params.taskId); // 1) Find the task by its ID

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project); // 2) Find the parent project from the task

    if (!project) {
      return res.status(404).json({ message: 'Parent project not found' });
    }

    // Step 3: Ownership check on the parent project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ message: 'Task deleted successfully' }); // 200 = Ok, confirms deletion
  } catch (error) { // Logs this error message to the server terminal, if the 'try' block fails technically
    res.status(500).json({ message: error.message }); // 500 = internal server error
  }
});


module.exports = router; // Exports the 'router' so 'server.js' can import it and mount it at '/api'