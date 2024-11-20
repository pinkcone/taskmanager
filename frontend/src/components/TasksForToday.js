import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import NavigationBar from './Navbar';
import Footer from './Footer';
import Modal from 'react-modal';
import { Container, Row, Col } from 'react-bootstrap';
import TaskDetailsModal from './TaskDetailsModal';

const TasksForToday = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [role, setRole] = useState('user');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get('/api/tasks', {
                headers: { 'x-auth-token': token }
            });
            const today = new Date().toISOString().split('T')[0];
            const todayTasks = res.data.filter(task => task.dueDate.split('T')[0] === today);
            setTasks(todayTasks);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setRole(decodedToken.user.role);
                fetchTasks();
            } catch (err) {
                // Handle invalid token or parsing error
                handleLogout();
            }
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, [token, fetchTasks, navigate, handleLogout]);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openTaskModal = (task) => {
        setSelectedTask(task);
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
    };

    return (
        <div className="App">
            {token ? (
                <>
                    <NavigationBar role={role} onLogout={handleLogout} token={token} openModal={openModal} />
                    <div className="App-content">
                        <Container>
                            <Row>
                                <Col>
                                    <h1>Zadania na dziś</h1>
                                    <Modal
                                        isOpen={modalIsOpen}
                                        onRequestClose={closeModal}
                                        contentLabel="Dodaj Zadanie"
                                    >
                                        <TaskForm fetchTasks={fetchTasks} closeModal={closeModal} />
                                    </Modal>
                                    {loading ? <p>Loading...</p> : (
                                        tasks.length > 0 ? (
                                            <TaskList tasks={tasks} fetchTasks={fetchTasks} openTaskModal={openTaskModal} />
                                        ) : (
                                            <div>
                                                <p>Nie masz na dzisiaj żadnych zadań. <span onClick={openModal} style={{ color: 'blue', cursor: 'pointer' }}>Dodaj nowe zadanie.</span></p>
                                            </div>
                                        )
                                    )}
                                    {selectedTask && (
                                        <TaskDetailsModal
                                            isOpen={!!selectedTask}
                                            task={selectedTask}
                                            closeModal={closeTaskModal}
                                            fetchTasks={fetchTasks}
                                        />
                                    )}
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <Footer />
                </>
            ) : (
                <div>
                <h1>Nie jesteś zalogowany</h1>
                <button onClick={handleLogout}>Zaloguj się</button>
                <button onClick={() => navigate('/register')}>Zarejestruj się</button>
            </div>
        )}
    </div>
);
};

export default TasksForToday;
