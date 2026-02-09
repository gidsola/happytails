/*
 * File Name: userController.js
 * Author(s):   
 * Student ID (s): 
 * Date: 
 */

import User from '../models/user.js';
import _ from 'lodash'; 
import jwt from 'jsonwebtoken';

const config = {
    jwtSecret: process.env.JWT_SECRET
};


// Middleware to pre-load a user profile based on the 'userId' parameter in the route
export const userByID = async (req, res, next, id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        const { password, ...safeUser } = user.toObject();
        req.profile = safeUser;
        next();
    } catch (err) {
        return res.status(400).json({
            error: "Could not retrieve user"
        });
    }
};

//SINGLE USER SECURE
// GET: Read the non-sensitive profile data of the user loaded by userByID
export const read = (req, res) => {
    return res.json(req.profile);
};

// PUT: Update user data
export const update = async (req, res, next) => {
    try {
        let user = await User.findById(req.profile._id);
        if (!user) return res.status(404).json({ error: "User not found during update." });
        const adminAuth = req.auth; // The person performing the update       

        const isSelfUpdate = adminAuth._id === user._id.toString();
        const isNotGlobalAdmin = adminAuth.role !== 'admin';
        if (isSelfUpdate && isNotGlobalAdmin) {
            // Remove sensitive fields from the body so they aren't merged by _.extend
            delete req.body.role;
            delete req.body.managementAccess;
        }
        // MERGE AND SAVE
       
        user = _.extend(user, req.body);
        user.updatedAt = Date.now();
        await user.save();
       
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        const { password, ...safeUser } = user.toObject();
        console.log(`[Update Success] User ${user.email} updated by ${adminAuth.role}`);
        res.json({
            token: token,
            user: safeUser
        });
    } catch (err) {
        return res.status(400).json({
            error: "Could not update user: " + err.message
        });
    }
};

// DELETE: Remove the user
export const remove = async (req, res, next) => {
    try {
        const user = req.profile; 
        const deletedUser = await user.deleteOne();
        const { password, ...safeUser } = deletedUser.toObject();
        res.json({ message: "User successfully deleted." });

    } catch (err) {
        return res.status(400).json({
            error: "Could not delete user: " + err.message
        });
    }
};


//GENERAL 
// POST: Create a new user 
export const create = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();      
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET: List all users
export const list = async (req, res) => {
    try {
        const users = await User.find().select('name email role created managementAccess'); // Select safe fields
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE: Delete all users
export const removeAll = async (req, res) => {
    try {
        const result = await User.deleteMany({});
        res.status(200).json({ message: `You deleted ${result.deletedCount} user(s)` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
