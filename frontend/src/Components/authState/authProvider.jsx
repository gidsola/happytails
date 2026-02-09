//import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContext';
//import { getUserRoles, signOut, forgotPassword, resetPassword } from '../Api/authApi';
import { ROUTES } from '../../Api/routingConfig';

export const AuthProvider = ({ children }) => {
  
    const value = {

    };



    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

