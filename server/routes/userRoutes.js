/*
 * File Name: userRoutes.js
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */

//const express = require('express');
import express from 'express';
const router = express.Router();
import * as authCtrl from '../controllers/authController.js';
import * as userCtrl from '../controllers/userController.js';


router.route('/')
    .post(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.create)       
    .get(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.list)          
    .delete(authCtrl.requireSignin, authCtrl.isAdmin,userCtrl.removeAll); 

router.route('/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);

router.param('userId', userCtrl.userByID); 

export default router;
