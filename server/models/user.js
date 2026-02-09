/*
 * File Name: user.js
 * Author(s): 
 * Student ID (s): 
 * Date:  
 */


import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';
import {dirname, resolve} from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = resolve(__dirname, '../public/documents/userRoles.json');
const rolesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const roles = [...rolesData.user, ...rolesData.admin];


const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String },
    // MANAGEMENT ACCESS
    managementAccess: {
        level1: { type: String, default: null },
        level2: { type: String, default: null }        
    },
    profileImage: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /\.(jpg|jpeg|png|gif|webp)$/i.test(v),
            message: "Profile image path must end with a valid image extension."
        },
        default: function () {
            const userId = this._id.toString();
            return `/users/${userId}/profileimage.png`;
        }
    },
    coverImage: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /\.(jpg|jpeg|png|gif|webp)$/i.test(v),
            message: "Profile image path must end with a valid image extension."
        },
        default: function () {
            const userId = this._id.toString();
            return `/users/${userId}/coverimage.png`;
        }
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    altEmail: { type: String, unique: true, sparse: true },
    address: {
        street: { type: String },
        addressLineTwo: { type: String },
        city: { type: String },
        Country: { type: String },
        province: { type: String },
        postalCode: { type: String }
    },
    hashed_password: {
        type: String, /*required: true*/ //currently the required validation is firing before the "pre" check
    },
    //PASSWORD RESET
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: { type: String, enum: roles, default: 'user' },
    dateOfBirth: { type: Date },
    lastLogin: { type: Date },
    // TWO-FACTOR AUTHENTICATION
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String
        // This will be the encrypted or plain TOTP secret used to verify codes
    },
    twoFactorBackupCodes: {
        type: [String],
        default: []
    }
}, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
});


UserSchema.virtual('password').set(function (password) {
    this._password = password;
})
    .get(function () {
        return this._password;
    });

//ASYNCHRONOUS PRE-SAVE HOOK (for secure hashing)
UserSchema.pre('save', async function (next) {

    if (!this._password) {
        return next();
    }
    // Hash password
    try {
        const hash = await bcrypt.hash(this._password, SALT_ROUNDS);
        this.hashed_password = hash;
        this.resetPasswordToken = undefined;
        this.resetPasswordExpires = undefined;
        this._password = undefined;
        next();
    } catch (err) {
        next(err);
    }
});


UserSchema.path('hashed_password').validate(function (v) {
    if (this._password && this._password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters.');
    }
    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required');
    }
    return true;
}, null);

UserSchema.methods = {

    authenticate: async function (plainText) {
        if (!plainText || !this.hashed_password) return false;
        try {
            return await bcrypt.compare(plainText, this.hashed_password);
        } catch (err) {
            console.error("Bycript authenticate failed:", err);
            return false;
        }
    },

    // 2FA Verification Logic
    verify2FA: function (token) {
        if (!this.twoFactorSecret) return false;

        // Use otplib or speakeasy to verify the 6-digit token against the secret
        // const isValid = otplib.authenticator.check(token, this.twoFactorSecret);
        // return isValid;

        return true; // Placeholder 
    },

    // 
    verifyBackupCode: async function (code) {
        for (let hashedCode of this.twoFactorBackupCodes) {
            const isMatch = await bcrypt.compare(code, hashedCode);
            if (isMatch) {
                // Remove the used code from the array (one-time use)
                this.twoFactorBackupCodes = this.twoFactorBackupCodes.filter(c => c !== hashedCode);
                await this.save();
                return true;
            }
        }
        return false;
    }


}


export default mongoose.model("User", UserSchema);