
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
