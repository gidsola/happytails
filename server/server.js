/*
 * File Name: server.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */


import express from 'express'; //ES Modules
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {dirname, join} from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
//ES Modules: defining directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

//API ROUTES
import userRoutes from './routes/userRoutes.js'; 
import authRoutes from './routes/authRoutes.js';

const mongoUri = process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI    // Cloud server (Live)
    : process.env.MONGO_LOCAL; // Local server (Dev)




//MONGO_DB Connection
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch(err => console.error('MongoDB connection error:', err.message));

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(cookieParser());


//STATIC
app.use('/documents', express.static(join(__dirname, 'public', 'documents')));
//API Routes (Json)
app.use('/api/user', userRoutes);
app.use('/api', authRoutes);

app.get('/', (_req, res,) => {
    res.status(200).json({ "message": "Any message indicating the server is working" }); //leav in for testing purposes
});

app.use((err, _req, res, _next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ "error": err.name + ": " + err.message })
    } else if (err) {
        res.status(400).json({ "error": err.name + ": " + err.message })
        console.log(err)
    }
})

const BASE_URL = process.env.MONGO_LOCAL ?
    `${process.env.LOCAL_HOST}${PORT}` || `http://localhost:${PORT}`
    : process.env.CLOUD_URL || 'undefined';

app.listen(PORT, () => {
    console.log(`Server is running at ${BASE_URL}`);
    console.log(`Users are visible at ${BASE_URL}${'/api/users'}`);
    console.log(`Authentications are visible at ${BASE_URL}${'/api'}`);
})




