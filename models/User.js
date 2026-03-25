// User Schema:

const mongoose = require('mongoose');  // Imports 'mongoose' for the file to use to create the User schema
const bcrypt = require('bcrypt'); // Imports bcrypt, which is the library needed to 'hash' passwords


const userSchema = new mongoose.Schema({ // creates a new schema/blueprint for the user that defines the shape of each document in MongoDB.
    // document shape for 'username'. Here, for the 'username' document...  
    username: {  
        type: String, // it must be a 'string',
        required: true, // it is 'required',
        trim: true //and trailspaces are automatically removed from it
    },
     // document shape for 'email'. Here, for the 'email' document...  
    email: {  
        type: String, // it must be a 'string',
        required: true,  // it is 'required',
        unique: true, // it must be unique, IOWs, no 2 users can have the same email in the database.
        trim: true, //trailspaces are automatically removed from it
        lowercase: true // it must be lowercase. If user enters data in caps, this property automatically converts it to lowercase before saving it to the database.
                        // IOws, lowercase and caps data is treated exactly the same.
    },
    // document shape for 'password'. Here, for the 'password' document...  
    password: {
        type: String, // it must be a 'string',
        required: true,  // it must be unique
        //trim: true  //removed as spaces could technically be part of a password
    }
}, { timestamps: true}) // This 2nd argument closes of the schema definition
                        // - 'timestamps:' when set to true, it tells Mongoose to automatically add 2 fields to every document:
                        // -- 'createdAt'
                        // -- 'updatedAt'

userSchema.pre('save', async function(){
//userSchema.pre('save', async function(next) { // This is a 'pre-save' hook that runs automatically before saving a user to the database
                                            // so this function runs automatically every time a user is about to be saved
                                            // use a regular function (not arrow function) because we need 'this' to refer to the user document being saved
                                            // it says "hey,whenever a save is about to happen, run this function first, and don't save until it's done"
                                            // is like a checkpoint that intercepts the 'save' operation before it reaches the database, ultimate protecting the DB from saving
                                            // paswords in plain text as in this case.

   // Only and only if password is NEW or has been CHNAGED, should it be hashed!!!!
  //if (!this.isModified('password')) return next();  // - 'this' refers to the user being saved
  if (!this.isModified('password')) return 
                                                    // 'isModified('password')' = checks or it's true ONLY if the password field has changed
                                                        // ITC, IF the password was NOT changed, like if we're just updating username                 
                                                        // THEN we skip the hashing and call 'next()' to continue saving normally
                                                        // This is IMPORATNT bc it prevents the app from hashing an already-hashed password!!!
  const salt = await bcrypt.genSalt(10); // random data characters added to the password before hashing ( aka 'salt')
                                        // ''10' is the "cost factor" which indicates how many processing rounds to run, thus the higher the cost factor the more secure but slower.
                                        // 10 is the standard safe choice
  this.password = await bcrypt.hash(this.password, salt); // this takes the 'plain text password' plus the 'salt' and produces a 'hash'
                                                        // so what gets saved to MongoDB is highly complex hash...and never teh real password.
  //next(); // this tells Mongoose that that the 'pre-save' hook has ran and finished running its checks before saving a user to the database
            // without this the app will hang forever waiting!!!!!!!!!!!!!
});

// Instance method: compares submitted password with hashed password
    userSchema.methods.isCorrectPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema); // this 1) creates the actual Model from the schema and 2) exports it
                                                    // 'User' is the model name, for which Mongoose will automatically create a collection called 'users' (lowercase + plural) 
                                                    // in MongoDB. Other files can now import this to create/find/update users

/*
#
- salt adds a very strong additional layer of security that protects a password from being easily hacked. Without it, the same password always produces the same hash. 
- leaving your password vulnerable to rainbow tables & brute force attacks that hackers use to break a password.
#
- schema = the rules
- model = the tool you use to interact with the database following those rules.
*/