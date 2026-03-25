
// DB Connection:

const mongoose = require('mongoose'); // Imports 'mongoose' for the file to use

const connectDB = async () => { // Defining a function called 'connectDB'. 'async' signals 'await'.
    try {  // "hey 1) try ta run teh following...""
        await mongoose.connect(process.env.MONGO_URI);  //- 'await' being used bc conneciton will take time
                                                        // - 'process.env.MONGO_URI' extracts database URL containing DB creds from your '.env' file to connect to Db
    console.log('MongoDB connected successfully');  // "...2) IF successful console log message....""

    } catch (error) { //"...3) ELSE console log error message below without crashing server"
         console.error('MongoDB connection error:', error.message);
        process.exit(1); //shuts the server down, stops Node.js app immediately rather than letting it run broken.
                        // "The 1 signals that it exited due to an error (as opposed to 0, which means a clean/normal exit). 
                        // There's no point running your backend if it can't reach the database. https://nodejs.org/api/process.html#processexitcode"
    }
}

module.exports = connectDB; //Exports the function 'connectDB' so other files like 'server.js' can import / call it to establish database connection when the app starts.