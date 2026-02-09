
import { API_URL } from "../../../config";
const BASE_URL = `${API_URL}`;

//Sigin API
export const signIn = async (email, password) => {

    const response = await fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ email, password }),
    });
    let data;

    // Error status
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || errorData.message || 'Login failed.');
    }
    try {
        // 
        data = await response.json();
    } catch (e) {
        console.error("Login successful but data was unreadable:", e);
        throw new Error("Login failed: Server returned success but no user data.");
    }

    if (!data.requires2FA && (!data.token || !data.user)) {
        throw new Error("Login failed: Response is missing necessary handshake data.");
    }

    return data;
};

// 2FA Verification API
export const verify2FA = async (email, token) => {
    const response = await fetch(`${BASE_URL}/2fa`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
    });

    let data;

    if (!response.ok) {
        try {
            data = await response.json();
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
            throw new Error(`Verification error: ${response.status}`);
        }
        throw new Error(data.error || 'Invalid verification code.');
    }

    data = await response.json();
    if (!data.token || !data.user) {
        throw new Error("Verification failed: Final handshake missing session data.");
    }

    return data;
};

//Signout API
export const signOut = async () => {
    await fetch(`${BASE_URL}/signout`, {
        method: 'GET'
    })
};

//Register API
export const signUp = async (name, email, password) => {

    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  
        },
        body: JSON.stringify({ name, email, password }),
    });
    let data;

    // ERROR STATUS 
    if (!response.ok) {
        let errorData = {};
        try {
            //
            errorData = await response.json();
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            throw new Error(`Server error during registration: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || errorData.message || 'Registration failed. Please check your inputs.');
    }

    // SUCCESSFUL STATUS
    try {

        data = await response.json();
    } catch (e) {
        console.error("Registration successful but user data was unreadable:", e);
        throw new Error("Registration successful, but server returned unreadable data.");
    }


    return data;
};

// Forgot Password API
export const forgotPassword = async (email) => {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Could not process forgot password request.');
    }
    return data;
};

// Reset Password API
export const resetPassword = async (token, newPassword) => {
    const response = await fetch(`${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Could not reset password.');
    }
    return data;
};

export const getUserRoles = async () => {
    const domainName = BASE_URL.replace('/api', '');

    const url = `${domainName}/documents/userRoles.json`;
    const response = await fetch(url); // Adjust path to your backend endpoint
    if (!response.ok) throw new Error('Failed to fetch roles');
    return await response.json();
};