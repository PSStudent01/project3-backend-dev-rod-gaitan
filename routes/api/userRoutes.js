
// Auth API -  User Routes

const express = require('express'); // Imports the express library so we can use the 'router' feature
const router = express.Router(); // creates a mini router object that works like a mini version of the app handling only user-related routes
const User = require('../../models/User');  // Imports the 'User' model so we can interact with the 'users' collection
const { signToken } = require('../../utils/auth'); // Imports ONLY the 'signToken' helper function from the 'auth' utility
                                                    // We have to use {} because multiple functions were exported out from 'auth.js' but only 1 is needed here (signToken) 
                                                    // we import 'signToken' because this file handles login/register
                                                   // Note...'protect' is NOT needed here because these routes are PUBLIC
                                                   // (anyone can register or login without a token)

// POST /api/users/register - Create a new user 
router.post('/register', async (req, res) => { // it defines a POST route at '/register'
                                                // in server.js it's mounted at '/api/users'
                                                // and so the full path becomes POST /api/users/register
                                                // req = incoming request, res = response we send back
  try { // try to attempt this code, but if somthing goes technaically wrong, jump to 'catch' to throw the proper error and don't crash"
     const user = await User.create(req.body);  // Takes the data the user submitted (username, email, password) from the request body and creates a new user document in MongoDB.
                                                 // Destructuring the request body
                                                // and when user sends a POST request and it includes data (the entire object) in the body
                                                // then this line extracts those 3 values out of req.body { "username": "rod", "email": "rod@email.com", "password": "123" }
     
         //const token = signToken(user);
     const token = signToken({ username: user.username, email: user.email, _id: user._id });  //Immediately generates a JWT token for the newly created user
     
                                                res.status(201).json({ token, user }); // Sends back a 201 means "created" response with both the token and user data. The frontend can store that token for future authenticated requests.

  } catch(error) {
     //res.status(400).json(error);
     res.status(400).json({ message: error.message }); //If anything goes wrong (duplicate email, missing fields, etc), it catches the error and sreturns a 400 (bad request) with the error details.
  }

})


// POST /api/users/login - Authenticate a user and return a token
router.post('/login', async (req, res) => { // Defines a POST route at /api/users/login.
    const user = await User.findOne({ email: req.body.email });  // this earches the database for a user with that email
                                                                // 'findOne()' returns the FIRST match it finds, or null if none found
                                                                // awaits  for this database search to finish before continuing

    if (!user) {                                                    // If user with that email not found....
    return res.status(400).json({ message: "Can't find this user" });  //....it stops and sends back a 400 error
                                                                       // 400 = "bad request" meaning the client sent invalid data
                                                                        // 'return' stops the function here so it don't keep going
    }

    const correctPw = await user.isCorrectPassword(req.body.password); // this calls the  'isCorrectPassword' method (defined in 'User' model) which uses bcrypt to compare the submitted password against the stored hash.

    if (!correctPw) {  // If the password doesn't match...
    return res.status(400).json({ message: 'Wrong password!' }); //...app stops and sends back a 400 error.
    }

    // const token = signToken(user);
    const token = signToken({ username: user.username, email: user.email, _id: user._id }) // IF BOTH checks pass, it generates a JWT token....
    res.json({ token, user });   //..and sends it back with the user data. The frontend stores this token to authenticate future requests.
})

module.exports = router;  //Exports the 'router' so your main 'server.js' can import it and mount it at '/api/users'.