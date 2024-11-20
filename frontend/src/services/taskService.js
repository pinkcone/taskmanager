import axios from 'axios';

const API_URL = '/api/tasks/';

const getTasks = async () => {
    const response = await axios.get(API_URL, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    return response.data;
};

const addTask = async (taskData) => {
    const response = await axios.post(API_URL, taskData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
    });
    return response.data;
};

// Podobnie dla updateTask i deleteTask

export default {
    getTasks,
    addTask,
    // updateTask,
    // deleteTask
};
