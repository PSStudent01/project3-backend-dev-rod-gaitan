
// Projects API -Project Routes

const express = require('express');  // Imports express so we can use the Router feature
const router = express.Router();  // creates a mini router for project-related routes
const Project = require('../../models/Project'); // Imports the 'Project' model so can talk to the 'projects' collection
const { protect } = require('../../utils/auth'); // Imports ONLY the 'protect' middleware from 'auth.js'
                                                // - 'signToken' not needed here because this file doesn't handle login
                                                // - 'protect' is needed because ALL project routes require authentication

// POST /api/projects - Create a new project
router.post('/', protect, async (req, res) => { // it defines a POST route at '/'
                                                // in 'server.js' it's mounted at '/api/projects'
                                                // and so the full path becomes POST /api/projects
                                                // 'protect' runs FIRST to check the token before anything else can happen
  try {  // try to attempt this code, but if somthing goes technaically wrong, jump to 'catch' to throw the proper error and don't crash"
    const project = await Project.create({ 
      ...req.body,                      // the SPREAD operator '...req.body' spreads out everything the user sent in the request body
                                        // for example if they sent { name: "My Project", description: "Cool project" }
                                        // it spreads those fields into the new project document
      user: req.user._id  // this adds the 'owner's ID' to the project
                        // 'req.user' is attached by the 'protect' middleware; 'req.user._id' is the logged in user's ID. This is how we know WHO owns this project
    });
    res.status(201).json(project);  // Returns a 201 (created) code with the new project
  } catch (error) { // Logs this error message to the server terminal, if the the 'try' block fails technically
    res.status(500).json({ message: error.message }); // 500 = internal server error
  }
});

// GET /api/projects - Get all projects 
 router.get('/', protect, async (req, res) => { 
  try {  // try to attempt this code, but if somthing goes technaically wrong, jump to 'catch' to throw the proper error and don't crash"
    const projects = await Project.find({ user: req.user._id });  // 'Project.find()' searches the database
                                                                // '{ user: req.user._id }' filters results to ONLY 'projects'
                                                                // where the 'user' field matches the 'logged in user's ID'
                                                                // which means ONLY users (and no one else) can see their own projects.
    res.status(200).json(projects); // 200 = success and then sends back the array of projects
  } catch (error) { // Logs this error message to the server terminal, if the the 'try' block fails technically
    res.status(500).json({ message: error.message });  // 500 = internal server error
  }
});

// GET /api/projects/:id - Get a single project
router.get('/:id', protect, async (req, res) => { // GET route at '/api/projects/:id' returns 
                                                 // ':id' is a URL parameter — a placeholder for the actual project ID (ex, GET /api/projects/64abc123)
  try {
    const project = await Project.findById(req.params.id); // 'Project.findById()' searches for ONLY 1 project by its MongoDB _id
                                                          // req.params.id grabs the ':id' value from the URL

    if (!project) { // IF  no project is found with the reuested ID...
      return res.status(404).json({ message: 'Project not found' });  // THEN this sends back '404 = not found' message
    }

    // This is an ownership check
    if (project.user.toString() !== req.user._id.toString()) { // 'project.user' = the ID of who owns this project (stored in database)
                                                                // 'req.user._id' = the ID of who is making this request (from token)
                                                                // '.toString()' converts both IDs to strings so we can compare them
                                                                // ELSE IF they DON'T match, it means that this user doesn't own this project.... 
      return res.status(403).json({ message: 'Not authorized to view this project' }); // ...THEN returns code 403 = Forbidden  (you're logged in but not allowed to view project)
    }

    res.status(200).json(project); //ELSE ownership check passes, and it returns the project 
  } catch (error) {   // Logs this error message to the server terminal, if the the 'try' block fails technically
    res.status(500).json({ message: error.message });  // 500 = internal server error
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', protect, async (req, res) => { // PUT route mounted at '/api/projects/:id' used for updating an existing document
  try {
    const project = await Project.findById(req.params.id); // awaits for the project to be searched/found so we can check ownership
                                                            // We need to find it BEFORE updating to verify the owner

    if (!project) { // IF  no project is found with the reuested ID...
      return res.status(404).json({ message: 'Project not found' }); // THEN this sends back a '404 = not found' message
    }

    if (project.user.toString() !== req.user._id.toString()) { // 'project.user' = the ID of who owns this project (stored in database)
                                                                // 'req.user._id' = the ID of who is making this request (from token)
                                                                // '.toString()' converts both IDs to strings so we can compare them
                                                                // ELSE IF they DON'T match, it means that this user doesn't own this project.... 
      return res.status(403).json({ message: 'Not authorized to update this project' }); //...THEN returns code 403 = Forbidden  (you're logged in but not allowed to update project)
    }

    const updatedProject = await Project.findByIdAndUpdate( // 'findByIdAndUpdate()' finds and updates in one operation
      req.params.id, // tells you which project to update
      req.body,        // tells you what to update it with (from request body)
      { new: true }      // it ensures that it returns the UPDATED version, not the old one, otherwise it returns the OLD document
    );

    res.status(200).json(updatedProject);  // // 200 = Ok , returns the updated project
  } catch (error) {  // Logs this error message to the server terminal, if the the 'try' block fails technically
    res.status(500).json({ message: error.message });   // 500 = internal server error
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', protect, async (req, res) => {   // SAME LOGIC AS ABOVE, EXCEPT THAT THI SIS FOR DELETING A PROJECT
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ownership check
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
 } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

/*
All 5 endpoints tested succesfully
POST - Create project
GET all - Get your projects
GET one - Get single project
PUT - Update project
DELETE - Delete project
*/