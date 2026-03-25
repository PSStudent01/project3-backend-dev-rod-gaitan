
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

  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch {
    console.log('Invalid token');
    return res.status(401).json({ message: 'Invalid token.' });
  }

  next();
}

// Helper function to create a signed JWT token
function signToken({ username, email, _id }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
}

module.exports = { protect, signToken };


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