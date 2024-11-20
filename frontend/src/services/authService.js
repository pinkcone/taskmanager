import axios from 'axios';

const API_URL = '/api/auth/';

const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
};

export default {
    register,
    login,
    logout
};
