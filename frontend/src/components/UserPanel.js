import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserPanel = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        newEmail: '',
        newUsername: ''
    });

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { oldPassword, newPassword, newEmail, newUsername } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const checkAuthentication = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                if (decodedToken.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/login');
                } else {
                    setIsAuthenticated(true);
                    setLoading(false);
                }
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication]);

    const onSubmitChangePassword = async e => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/auth/change-password', { oldPassword, newPassword }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            console.log(res.data);
            alert('Password changed successfully');
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Error changing password');
        }
    };

    const onSubmitChangeEmail = async e => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/auth/change-email', { newEmail }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            console.log(res.data);
            alert('Email changed successfully');
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Error changing email');
        }
    };

    const onSubmitChangeUsername = async e => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/auth/change-username', { newUsername }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            console.log(res.data);
            alert('Username changed successfully');
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Error changing username');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isAuthenticated) {
        return <p>Not authorized</p>;
    }

    return (
        <div>
            <h1>User Panel</h1>
            <form onSubmit={onSubmitChangePassword}>
                <div>
                    <label>Old Password:</label>
                    <input type="password" name="oldPassword" value={oldPassword} onChange={onChange} required />
                </div>
                <div>
                    <label>New Password:</label>
                    <input type="password" name="newPassword" value={newPassword} onChange={onChange} required />
                </div>
                <button type="submit">Change Password</button>
            </form>
            <form onSubmit={onSubmitChangeEmail}>
                <div>
                    <label>New Email:</label>
                    <input type="email" name="newEmail" value={newEmail} onChange={onChange} required />
                </div>
                <button type="submit">Change Email</button>
            </form>
            <form onSubmit={onSubmitChangeUsername}>
                <div>
                    <label>New Username:</label>
                    <input type="text" name="newUsername" value={newUsername} onChange={onChange} required />
                </div>
                <button type="submit">Change Username</button>
            </form>
        </div>
    );
};

export default UserPanel;
