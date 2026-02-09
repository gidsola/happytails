/*
 * File Name: 
 * Author(s): 
 * Student ID (s): 
 * Date: 
 */




import express from 'express';
const router = express.Router();
import * as authCtrl from '../controllers/authController.js';

router.route('/signin').post(authCtrl.signin);
router.route('/signout').get(authCtrl.signout);
router.route('/register').post(authCtrl.register); //Creates User can be accessed from userRoutes
router.route('/2fa').post(authCtrl.verify2FA);


// PASSWORD RESET ROUTES
router.route('/forgot-password').post(authCtrl.forgotPassword);
router.route('/reset-password').post(authCtrl.resetPassword);

export default router;
