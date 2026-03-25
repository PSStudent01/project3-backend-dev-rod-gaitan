// Task Schema

const mongoose = require('mongoose'); // Imports 'mongoose' for the file to use to create the Project schema

const taskSchema = new mongoose.Schema({ // creates a new schema/blueprint for the task that defines the shape of each document in MongoDB.
    // document shape for 'task' field. Here, for the 'task' document...  
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],    // 'enum' means this field can ONLY be one of these 3 values
                                               // ...so if you try to save something like  "status: 'Completed'"" for example, Mongoose will reject it with a validation error
    default: 'To Do'
  },
   project: {
    type: mongoose.Schema.Types.ObjectId, // - 'mongoose' — the library we imported
                                        //- '.ObjectId' — a special MongoDB data type that is a unique 24-character ID that MongoDB automatically generates for every document
    ref: 'Project', // - 'Project' matches the model name we exported in 'Project.js' ('mongoose.model('Project', projectSchema)')
                 // - This tells Mongoose "hey, that ObjectId I'm storing? It belongs to the Project collection", pointing to the 'Project' collection
                //- This is what associates 'ObjectId' with the 'Project' collection. 
                //- This is useful later for a Mongoose feature called '.populate()' which swaps that ID out with the actual full user object when needed   
    required: true   // enforces that the task MUST belong to a project.  IOW, the input is required.
  }
}, { timestamps: true }); // This 2nd argument closes of the schema definition
                        // - 'timestamps:' when set to true, it tells Mongoose to automatically add 2 fields to every document:
                        // -- 'createdAt'
                        // -- 'updatedAt'

module.exports = mongoose.model('Task', taskSchema); // this 1) creates the actual Model from the schema and 2) exports it
                                                    // 'Task' is the model name, for which Mongoose will automatically create a collection called 'tasks' (lowercase + plural) 
                                                    // in MongoDB. Other files can now import this to create/find/update users

