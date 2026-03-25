
//  Middleware — the JWT verification utility that protects routes.


const jwt = require('jsonwebtoken'); // Imports the 'jsonwebtoken' library so we can create/verify tokens

const secret = process.env.JWT_SECRET;  // This extracts our secret key from the '.env' file from env variable JWT_SECRET, which is the key used to 
                                        // SIGN/CREATE tokens and VERIFY/CHECK tokens

const expiration = '2h'; // Sets how long tokens are valid for, ITC 2 hours
                        // After 2 hours the token expires and the user has to log in again
                        // Also stored in a variable so it's easy to change later

