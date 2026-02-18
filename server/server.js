
import 'dotenv/config';
import { STATIC_ASSETS } from '../enums/SERVER_ENUMS.js';

import mongoose from 'mongoose';
import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import helmet from 'helmet';

import rateLimit from './middlewares/rateLimiter.js'
import routeMaster from './routes/routeMaster.js';
import serverListener from './listener.js';

const
    mongoUri = process.env.NODE_ENV === 'production'
        ? process.env.MONGO_PROD    // Cloud server (Live)
        : process.env.MONGO_DEV, // Local server (Dev)

    app = express();

//MONGO_DB Connection
// bypass for testing without mongo installed.
const hasMongo = false;
if (hasMongo) {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully!')
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
    };
}

app
    .use(cors(
        {
            origin: process.env.DOMAIN,
            credentials: true
        }
    ))
    .use(compress())
    .use(cookieParser())
    .use(express.json({ limit: '10mb' }))
    .use(express.urlencoded({ limit: '10mb', extended: true }))
    .use(helmet())
    .use(express.static(STATIC_ASSETS()))

    // .use((err, _req, res, _next) => {
    //     if (err.name === 'UnauthorizedError') {
    //         res.status(401).json({ "error": err.name + ": " + err.message })
    //     }
    //     else if (err) {
    //         res.status(400).json({ "error": err.name + ": " + err.message })
    //         console.log(err)
    //     }
    // })
    .get(/^(?!\/api).*/, rateLimit/*, metadata*/);

await routeMaster(app);
await serverListener(app);
