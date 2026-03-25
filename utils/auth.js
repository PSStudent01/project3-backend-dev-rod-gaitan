
//  Middleware — the JWT verification utility that protects routes.


const jwt = require('jsonwebtoken'); // Imports the 'jsonwebtoken' library so we can create/verify tokens

const secret = process.env.JWT_SECRET;  // This extracts our secret key from the '.env' file from env variable JWT_SECRET, which is the key used to 
                                        // SIGN/CREATE tokens and VERIFY/CHECK tokens

const expiration = '2h'; // Sets how long tokens are valid for, ITC 2 hours
                        // After 2 hours the token expires and the user has to log in again
                        // Also stored in a variable so it's easy to change later

// Middleware to protect routes - verifies the JWT token
function protect(req, res, next) {  // Defining a middleware function called 'protect'
                                    // req = the incoming request from the client
                                    // res = the response we can send back
                                    // next = a function that says "ok, move on to the actual route", referring to the SUBSEQUENT arguments of your 'route definition (route handler)' See notes #1*
  let token = req.body?.token || req.query?.token || req.headers.authorization; // Looks for the token in 3 places:
                                                                                // 'req.body?.token' = inside the request body (form data)
                                                                                // 'req.query?.token' = inside the URL (?token=xyz)
                                                                               // 'req.headers.authorization' = inside the request headers 
                                                                               //  '?.' says "hey search for token in (body,url, req header ) but don't crash if it doesn't exist"
                                                                               // '||' says  "if the first shows empty token, try the next one"
                                                                
  if (req.headers.authorization) {  //this checks specifically IF the token came from the 'headers', because header tokens look like "Bearer eyJhbGc..."  need to strip the "Bearer" off the front
    token = token.split(' ').pop().trim();  //Mechanismn behind the stripping of the 'Bearer' word. See notes #2*
  }

  if (!token) { // this says "IF" after searching we STILL don't have a token...
    return res.status(401).json({ message: 'You must be logged in to do that.' }); //...THEN return:
                                                                                    // ...return a 401 (Unauthorized) error and stop here
  }

  try { // try to attempt this code, but if somthing goes technaically wrong, jump to 'catch' to throw the proper error and don't crash"
    const { data } = jwt.verify(token, secret);
    //const { data } = jwt.verify(token, secret, { maxAge: expiration }); // jwt.verify() does 2 things:
                                                                        // 1. Checks the token hasn't been tampered with using our 'secret key'
                                                                        // 2. Decodes the token and returns what was stored inside it
                                                                        // { maxAge: expiration } checks the token isn't older than 2 hours
                                                                        // { data } being destructured since the token payload was wrapped in 'data'
                                                                        //   when we created it, so we unwrap it the same way here
    req.user = data; // this attaches the decoded user info from 'data' to the request object
                    // thus making 'req.user' available in every route that comes after
                    // So routes can know WHO is making the request
                   // user info will contain: { username, email, _id }. These 3 params come from a) User document that MongoDB creates when a user registers!
                // and b) from the 'models/User.js' file OR c) helper function as seen below
  } catch {
    console.log('Invalid token'); // Logs this error message to the server terminal, if the the 'try' block fails technically (bad token, expired, tampered with), NOT as a 
                                    // result of invalid user input as that's handled by the f (!token) condition)  
    return res.status(401).json({ message: 'Invalid token.' }); // Sends back a 401 error to the client and stops here
  }

  next(); // If code ,maaakes it this far, the token is valid! and function 'next()' tells Express that 1) security check passed 2)no technical errors and therefore ok to run route now"
}

// Helper function to create a signed JWT token
function signToken({ username, email, _id }) { // signToken = A helper function that CREATES a new token
                                                // { username, email, _id } is destructuring as we pass in a user object and pull out just these 3 fields
  const payload = { username, email, _id };  // Packages those 3  fields into an object called 'payload', which is the data we want to store INSIDE the token.
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration }); // 'jwt.sign()' creates and returns a new token
                                                                        // '{ data: payload }' = wraps payload in a 'data' key, which is later unwrapped with { data } in '.verify'
                                                                       // 'secret' = signs/marks it with our secret key so it can't be faked
                                                                       // { expiresIn: expiration } = sets the 2 hour expiration
}

module.exports = { protect, signToken }; // Exports BOTH functions so other files can import them
                                        // protect -> used in routes as middleware to guard them
                                        // signToken -> used in the login route to create tokens


//[ * ]
/*
#1
Illustrating how the 'next' function works here:
- 'next()' points to the route definition found in 'routes/api/projectRoutes.js'
*
router.get('/api/projects', protect, getProjects)
                             |          |
                          runs 1st    runs 2nd

- so that here inside 'protect', when we call next(), it literally means "stop running 'protect()' and go run 'getProjects()' now, BASED ON the order of arguments in route def.
*/

/*
#2
//Mechanismn behind the stripping of the 'Bearer' word
- split(' ') breaks "Bearer eyJhbGc..." into ["Bearer", "eyJhbGc..."]
- .pop() grabs the LAST item in that array -> "eyJhbGc..."
- .trim() removes any trail spaces
- So now 'token' is just the pure token string

#3
-  401 = "you need to authenticate first"
*/