import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TasksForToday from './components/TasksForToday';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import Login from './components/Login';
import Register from './components/Register';
import { NotificationProvider } from './context/NotificationContext';

function App() {
    const token = localStorage.getItem('token');
    return (
        <Router>
            <NotificationProvider token={token}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks-for-today" element={<TasksForToday />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/user" element={<UserPanel />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </NotificationProvider>
        </Router>
    );
}

export default App;
