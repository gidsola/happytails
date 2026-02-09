/*
 * File Name: authController.js
 * Author(s):     
 * Student ID (s): 
 * Date: 
 * Note: 
 */



import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import crypto from 'crypto'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, '../public/documents/userRoles.json');
const rolesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const adminRoles = rolesData.admin;

dotenv.config();
const config = {
    jwtSecret: process.env.JWT_SECRET
};



export const register = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();

        const userObject = savedUser.toObject();
        delete userObject.password;

        return res.status(201).json(userObject);

    } catch (err) {
        // Handle validation errors or duplicate keys
        return res.status(400).json({ error: err.message });
    }
};

//login/sigin 
export const signin = async (req, res) => {
    try {
        if (!req.body.password) {
            return res.status(401).json({ error: "Password is required for sign-in." });
        }
        let user = await User.findOne({ "email": req.body.email });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const isAuthenticated = await user.authenticate(req.body.password);
        if (!isAuthenticated) {
            return res.status(401).json({ error: "Email and password don't match." });
        }
        
        if (user.twoFactorEnabled) {
            return res.status(200).json({
                requires2FA: true,
                email: user.email
            });
        }
        user.lastLogin = Date.now();
        await user.save();

        const userObject = user.toObject();
        delete userObject.password;
        delete userObject.twoFactorSecret;
        delete userObject.twoFactorBackupCodes;
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            config.jwtSecret);

        const responseData = {
            token: token,
            user: userObject
        }
        //Set cookie //removes sensitive user data
        /* res.cookie('t', token, {//remove for deployment to work //was setting an http cookie reverting to localstorage
             expire: new Date(Date.now() + 99990000)
             //httpOnly: true, //recommended for security
             //secure: process.env.NODE_ENV === 'production',//recommended for production
             // sameSite: 'None'// Ensures the cookie is sent in cross-site requests
 
         });*/

        return res.status(200).json(responseData);
        /*res.setHeader('Content-Type', 'application/json');
        res.status(200);
        return res.end(JSON.stringify(responseData));*/

    } catch (err) {
        return res.status(401).json({ error: "Could not sign in: " + err.message });
    }
};

export const signout = (_req, res) => {
    return res.status(200).json({ message: "signed out" });
};

//PASSWORD RESET LOGIC 

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "No account with that email exists." });

        const token = crypto.randomBytes(20).toString('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        return res.status(200).json({
            message: "Reset token generated successfully.",
            token: token
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired." });
        }
        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: "Password has been successfully reset." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 2FA Verification Logic
export const verify2FA = async (req, res) => {
    const { email, token } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const isValid = await user.verify2FA(token);

        if (!isValid) {
            return res.status(401).json({ error: "Invalid verification code." });
        }

        user.lastLogin = Date.now();
        await user.save();

        const userObject = user.toObject();
        delete userObject.password;
        delete userObject.twoFactorSecret;
        delete userObject.twoFactorBackupCodes;

        const jwtToken = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            config.jwtSecret
        );

        return res.status(200).json({
            token: jwtToken,
            user: userObject
        });

    } catch (err) {
        return res.status(500).json({ error: "Verification failed: " + err.message });
    }
};

//MIDDLEWARE
//requireSignin
export const requireSignin = expressjwt({
    secret: config.jwtSecret,
    userProperty: 'auth', // Attaches decoded JWT payload to req.auth
    algorithms: ['HS256']  //defineds a specific algorithm to use 
});


//hasAuthorization
export const hasAuthorization = (req, res, next) => {
    const auth = req.auth;
    const role = auth.role;
    if (role === 'admin') return next();
    const isProfileOwner = req.profile && (req.profile._id.toString() === auth._id.toString());
    if (isProfileOwner) return next();
    if (adminRoles.includes(role)) {
        return next();
    }
    return res.status(403).json({
        error: "Access Denied: You do not have permission for this resource."
    });
};


export const isAdmin = (req, res, next) => {
    const userRole = req.auth && req.auth.role;
    if (!req.auth || !adminRoles.includes(userRole)) {
        return res.status(403).json({
            error: "User is not authorized. Admin access required."
        });
    }
    next();
};



