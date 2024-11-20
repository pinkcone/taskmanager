import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const onChange = e => setQuery(e.target.value);

    const onSearch = async e => {
        e.preventDefault();
        try {
            const res = await axios.get(`/api/auth/users?query=${query}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Error searching users');
        }
    };

    const onSelectUser = user => {
        setSelectedUser(user);
    };

    const onUpdateRole = async (userId, role) => {
        try {
            const res = await axios.put(`/api/auth/users/${userId}/role`, { role }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            alert(res.data.msg);
            setSelectedUser(null);
            setQuery('');
            setUsers([]);
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Error updating user role');
        }
    };

    const checkAdminRole = useCallback(() => {
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
                } else if (decodedToken.user.role !== 'admin') {
                    navigate('/');
                } else {
                    setIsAdmin(true);
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
        checkAdminRole();
    }, [checkAdminRole]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isAdmin) {
        return <p>Not authorized</p>;
    }

    return (
        <div>
            <h1>Admin Panel</h1>
            <form onSubmit={onSearch}>
                <div>
                    <label>Search User by Username or Email:</label>
                    <input type="text" value={query} onChange={onChange} required />
                </div>
                <button type="submit">Search</button>
            </form>
            {users.length > 0 && (
                <div>
                    <h2>Search Results:</h2>
                    <ul>
                        {users.map(user => (
                            <li key={user._id} onClick={() => onSelectUser(user)}>
                                {user.username} ({user.email}) - {user.role}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {selectedUser && (
                <div>
                    <h2>Update Role for {selectedUser.username}:</h2>
                    <button onClick={() => onUpdateRole(selectedUser._id, 'user')}>Set as User</button>
                    <button onClick={() => onUpdateRole(selectedUser._id, 'admin')}>Set as Admin</button>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
