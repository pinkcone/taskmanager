import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const NotificationContext = createContext();

export const NotificationProvider = ({ token, children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tasks/notifications', {
                headers: { 'x-auth-token': token }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(notification => !notification.notificationRead).length);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 100);
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
