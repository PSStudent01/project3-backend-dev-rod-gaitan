
const mongoose = require('mongoose'); // Imports 'mongoose' for the file to use to create the Project schema

const projectSchema = new mongoose.Schema({ // creates a new schema/blueprint for the project that defines the shape of each document in MongoDB.
    // document shape for 'name'. Here, for the 'name' document...  
  name: {
        type: String, // it must be a 'string',
        required: true, // it is 'required',
        trim: true //and trailspaces are automatically removed from it
  },
    // document shape for 'description'. Here, for the 'description' document...  
  description: {
        type: String, // it must be a 'string',
        trim: true //and trailspaces are automatically removed from it
  },
    // document shape for 'user'. Here, for the 'user' document...  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);