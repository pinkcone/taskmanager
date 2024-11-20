import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Sidebar from './Sidebar';
import Modal from 'react-modal';
import 'react-calendar/dist/Calendar.css';
import TaskDetailsModal from './TaskDetailsModal';
import NavigationBar from './Navbar';
import Footer from './Footer';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { NotificationContext } from '../context/NotificationContext';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('user');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [dayTasksModalIsOpen, setDayTasksModalIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [dayTasks, setDayTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();
    const { state } = useLocation();
    const username = state?.username || localStorage.getItem('username') || 'User';
    const token = localStorage.getItem('token');
    const { fetchNotifications } = useContext(NotificationContext);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get('/api/tasks', {
                headers: { 'x-auth-token': token }
            });
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            setRole(decodedToken.user.role);
            fetchTasks();
        } else {
            setLoading(false);
        }
    }, [token, fetchTasks]);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openDayTasksModal = (tasks, date) => {
        setDayTasks(tasks);
        setSelectedDate(date);
        setDayTasksModalIsOpen(true);
    };

    const closeDayTasksModal = () => {
        setDayTasksModalIsOpen(false);
        setDayTasks([]);
        setSelectedDate(null);
    };

    const openTaskModal = (task, fromNotification = false) => {
        setSelectedTask({ ...task, reloadOnEdit: fromNotification });
        setDayTasksModalIsOpen(false);
    };
    
    const closeTaskModal = () => {
        setSelectedTask(null);
        fetchNotifications(); // Fetch notifications when task modal is closed
    };

    const onDateClick = (date) => {
        const dayTasks = tasks.filter(task => new Date(task.dueDate).toDateString() === date.toDateString());
        openDayTasksModal(dayTasks, date);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="App">
            {token ? (
                <>
                    <NavigationBar role={role} onLogout={handleLogout} token={token} />
                    <div className="App-content">
                        <div className="sidebar">
                            <div className="sidebar-icon">
                                <FontAwesomeIcon icon={faCalendarAlt} />
                            </div>
                            <div className="sidebar-content">
                                <div>Kalendarz</div>
                                <Sidebar tasks={tasks} onDateClick={onDateClick} />
                            </div>
                        </div>
                        <div className="content-wrapper">
                            <Container>
                                <Row>
                                    <Col>
                                        <h1>Lepiej wykorzystaj swój czas z nami, {username}</h1>
                                        <Modal
                                            isOpen={modalIsOpen}
                                            onRequestClose={closeModal}
                                            contentLabel="Dodaj Zadanie"
                                        >
                                            <TaskForm fetchTasks={fetchTasks} closeModal={closeModal} />
                                        </Modal>
                                        {loading ? <p>Loading...</p> : <TaskList tasks={tasks} fetchTasks={fetchTasks} openTaskModal={openTaskModal} />}
                                        <Modal
                                            isOpen={dayTasksModalIsOpen}
                                            onRequestClose={closeDayTasksModal}
                                            contentLabel="Tasks for the Day"
                                        >
                                            <h2>Zadania na dzień: {selectedDate && formatDate(selectedDate)}</h2>
                                            {dayTasks.map(task => (
                                                <div key={task._id} onClick={() => openTaskModal(task)}>
                                                    <h3>{task.title}</h3>
                                                </div>
                                            ))}
                                            <button onClick={closeDayTasksModal}>Close</button>
                                        </Modal>
                                        {selectedTask && (
                                            <TaskDetailsModal
                                                isOpen={!!selectedTask}
                                                task={selectedTask}
                                                closeModal={closeTaskModal}
                                                fetchTasks={fetchTasks}
                                                reloadOnUpdate={selectedTask.reloadOnEdit}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                    <Footer />
                </>
            ) : (
                <div>
                    <h1>Nie jesteś zalogowany</h1>
                    <button onClick={handleLogin}>Zaloguj się</button>
                    <button onClick={handleRegister}>Zarejestruj się</button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
