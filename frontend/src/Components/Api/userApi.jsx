
import { API_URL } from "../../../config";
const BASE_URL = `${API_URL}/user`;

const getAuthHeaders = async (getToken) => {
    const jwt = await getToken();
    if (!jwt) {
        throw new Error('User not authorized. Please Login.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
    };
};

const getAuthHeadersNoJson = async (getToken) => {
    const jwt = await getToken();
    if (!jwt) {
        throw new Error('User not authorized. Please Login.');
    }
    return {
        'Authorization': `Bearer ${jwt}`
    };
};

const fetchHelper = async (url, options) => {
    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({ message: 'No response body' }));

        if (response.ok) {
            console.log('API call successful:', url, data);
            return data;
        } else {
            const errorMessage = data.message || `API request failed with status: ${response.status}.`;
            console.error('API call failed:', response.status, data);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Network or Authorization error:', error);
        throw error;
    }
};

//Create a user entry
const create = async (userData, getToken) => {//
    const headers = await getAuthHeaders(getToken);

    return fetchHelper(BASE_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(userData),
    });

};


//List all users
const list = async (getToken) => {
    const headers = await getAuthHeaders(getToken);
    return fetchHelper(BASE_URL, {
        method: 'GET',
        headers: headers,
    });
};

//Delete all users
const deleteAll = async (getToken) => {
    const headers = await getAuthHeaders(getToken);

    return fetchHelper(BASE_URL, {
        method: 'DELETE',
        headers: headers,
    });
};

//List one user
const read = async (userId, getToken) => {
    const headers = await getAuthHeaders(getToken);
    const url = `${BASE_URL}/${userId}`

    return fetchHelper(url, {
        method: 'GET',
        headers: headers,
    });
};

//Update user entry
const update = async (userData, userId, getToken) => {
    const headers = await getAuthHeaders(getToken);
    const url = `${BASE_URL}/${userId}`

    return fetchHelper(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(userData)       
    });
};

//Delete one user
const remove = async (userId, getToken) => {
    const headers = await getAuthHeaders(getToken);
    const url = `${BASE_URL}/${userId}`
    return fetchHelper(url, {
        method: 'DELETE',
        headers: headers,
    });
};

//PROFILE
const getCountries = async () => {
    const domainName = BASE_URL.replace('/api/user', '');
    const url = `${domainName}/documents/country.json`;

    return fetchHelper(url, {
        method: 'GET'
    });


};

const getImages = (image, userId) => {
    const domainName = BASE_URL.replace('/api/user', '');
    const isPlaceholder = image === 'coverimage' || image === 'profileimage'
    if (isPlaceholder) {
        return `${domainName}/images/temp/${image}.png`;
    }
    
    return `${domainName}/user/${userId}/${image}`;
};

//UPLOADS USER PICTURES
const uploadPictures = async (data, getToken) => {

    const headers = await getAuthHeadersNoJson(getToken);
    const userFolder = data._id.toString();
    const domainName = BASE_URL.replace('/api/user', '');

    const url = `${domainName}/user/${userFolder}/`;
    const formData = new FormData();
    formData.append('imageFile', data.file);
    formData.append('userId', data._id);
    formData.append('fileName', data.fileName);      // e.g., "profile_shot"
    formData.append('extension', data.extension);    // e.g., ".jpg"

    
    return fetchHelper(url, {
        method: 'POST',
        headers: headers,
        body: formData, 
    });
};
export default { create, list, deleteAll, read, update, remove, getCountries, getImages, uploadPictures };