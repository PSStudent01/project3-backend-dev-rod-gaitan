// Entry point

require('dotenv').config(); //this loads the  '.env' file at start up, so every file in the app has access to 'process.env' env variables
const express = require('express');  // loads Express to your app after having been installed
const connectDB = require('./config/db'); // imports a database connection function 'connectDB' from file './config/db.js.' and giving it the same name 'connectDB'

const app = express(); // - 'express()' = function that comes from the Express library. 
                        // When you call it, it creates a complete 'Express application object' and stores it in the variable 'app'.
                        // allowing 'app' to become sorta like UI upon which you can adapt functions (.use, .get, .post, .listen, etc) that create the methods you use with your API
                        // without this line, 'app' would just be 'undefined'.
// Connect to DB
connectDB(); // Connects app to database. Calls the function 'connectDB()' in 'connection.js' to establish a DB connection when the server starts.


// Middleware
app.use(express.json()); // this middleware tells 'Express' to automatically parse incoming request bodies as JSON. 
                        // without this, when someone sends a POST request (to my API) with product data, 'req.body' would be 'undefined'.


//Routes
app.use('/api/users', require('./routes/api/userRoutes'));
app.use('/api/projects', require('./routes/api/projectRoutes'));


const PORT = process.env.PORT || 3001; // checks if there's a PORT variable defined in the .env file. IF there is one, it'll use it. ELSE, if there isn't one, it'll use default 3001.

app.listen(PORT, () => { // this starts the server and starts listening for incoming API requests on that port.
                        // 'app' is defined in line 'const app = express();'.
  console.log(`Server running on port ${PORT}`);  // The callback function THEN fires and executes the code that console logs a connection message, once the server is up and running.
});