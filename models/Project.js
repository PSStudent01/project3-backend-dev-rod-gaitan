
const mongoose = require('mongoose'); // Imports 'mongoose' for the file to use to create the Project schema

const projectSchema = new mongoose.Schema({ // creates a new schema/blueprint for the project that defines the shape of each document in MongoDB.
    // document shape for 'name' field. Here, for the 'name' document...  
  name: {
        type: String, // it must be a 'string',
        required: true, // it is 'required',
        trim: true //and trailspaces are automatically removed from it
  },
    // document shape for 'description' field. Here, for the 'description' document...  
  description: {
        type: String, // it must be a 'string',
        trim: true //and trailspaces are automatically removed from it
  },
    // document shape for 'user' field. Here, for the 'user' document...  
  user: {
    type: mongoose.Schema.Types.ObjectId, // - 'mongoose' — the library we imported
                                        //- '.ObjectId' — a special MongoDB data type that is a unique 24-character ID that MongoDB automatically generates for every document
    ref: 'User',  // - 'User' matches the model name we exported in 'User.js' ('mongoose.model('User', userSchema)')
                 // - This tells Mongoose "hey, that ObjectId I'm storing? It belongs to the User collection"
                //- This is what associates 'ObjectId' with the 'User' collection.
                //- This is useful later for a Mongoose feature called '.populate()' which swaps that ID out with the actual full user object when needed   
    required: true // it is 'required'
  }
}, { timestamps: true }); // This 2nd argument closes of the schema definition
                        // - 'timestamps:' when set to true, it tells Mongoose to automatically add 2 fields to every document:
                        // -- 'createdAt'
                        // -- 'updatedAt'

module.exports = mongoose.model('Project', projectSchema); // this 1) creates the actual Model from the schema and 2) exports it
                                                    // 'Project' is the model name, for which Mongoose will automatically create a collection called 'projects' (lowercase + plural) 
                                                    // in MongoDB. Other files can now import this to create/find/update users



