import React, { useContext } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationContext } from '../context/NotificationContext';
import axios from 'axios';

const NotificationDropdown = ({ setSelectedTask }) => {
    const { notifications, unreadCount, fetchNotifications } = useContext(NotificationContext);
    const token = localStorage.getItem('token');

    const handleNotificationClick = async (notification) => {
        try {
            const res = await axios.get(`/api/tasks/${notification._id}`, {
                headers: { 'x-auth-token': token }
            });
            const fullTask = res.data;

            setSelectedTask({ ...fullTask, reloadOnEdit: true });

            await axios.put(`/api/tasks/notifications/${notification._id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const isOverdue = (dueDate) => {
        const today = new Date();
        return new Date(dueDate) < today;
    };

    return (
        <Dropdown align="end">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && <Badge variant="danger">{unreadCount}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {notifications.length === 0 ? (
                    <Dropdown.Item>Brak powiadomień</Dropdown.Item>
                ) : (
                    notifications.map(notification => (
                        <Dropdown.Item key={notification._id} onClick={() => handleNotificationClick(notification)}>
                            <div>
                                <strong>Zadanie:</strong> {notification.title}<br />
                                {isOverdue(notification.dueDate) ? (
                                    <small>Termin wykonania zadania minął: {new Date(notification.dueDate).toLocaleDateString('pl-PL')}</small>
                                ) : (
                                    <small>Zbliża się termin wykonania zadania: {new Date(notification.dueDate).toLocaleDateString('pl-PL')}</small>
                                )}
                            </div>
                        </Dropdown.Item>
                    ))
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationDropdown;
