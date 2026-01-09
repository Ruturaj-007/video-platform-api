import multer from "multer";

const storage = multer.diskStorage({        // Tells Multer Where and how should I store uploaded files
    destination: function(req, file, cb) {  // saving files in local folder on your server inside ./public/temp folder  
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

export const upload = multer({  // middleware function called upload created 
    storage,
})

// MULTER is an Express middleware that handles multipart/form-data, extracts uploaded files, stores them 
// temporarily on the server, and makes them accessible via req.files for further processing.

// Request arrives
// ↓
// Multer intercepts request
// ↓
// Parses multipart/form-data
// ↓
// Saves files to ./public/temp
// ↓
// Adds info to req.files
// ↓
// Calls next() → controller
