import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import NotificationDropdown from './NotificationDropdown';
import TaskDetailsModal from './TaskDetailsModal';
import TaskForm from './TaskForm';
import Modal from 'react-modal';

const NavigationBar = ({ role, onLogout, token }) => {
    const navigate = useNavigate();
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await axios.get('/api/tasks', {
                headers: { 'x-auth-token': token }
            });
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const closeTaskModal = () => {
        setSelectedTask(null);
        fetchTasks(); // Reload tasks after closing the modal
    };

    const closeFormModal = () => {
        setModalIsOpen(false);
        fetchTasks(); // Reload tasks after closing the form modal
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">Task Manager</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate('/tasks-for-today')}>Zadania na dziś</Nav.Link>
                        </Nav>
                        <Nav>
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="add-task-tooltip">Dodaj Zadanie</Tooltip>}
                            >
                                <Nav.Link onClick={() => setModalIsOpen(true)}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </Nav.Link>
                            </OverlayTrigger>
                            <NotificationDropdown setSelectedTask={setSelectedTask} />
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                    {role === 'admin' ? 'A' : 'U'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {role === 'admin' && (
                                        <Dropdown.Item onClick={() => navigate('/admin')}>Panel Administratora</Dropdown.Item>
                                    )}
                                    <Dropdown.Item onClick={() => navigate('/user')}>Panel Użytkownika</Dropdown.Item>
                                    <Dropdown.Item onClick={onLogout}>Wyloguj się</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeFormModal}
                contentLabel="Dodaj Zadanie"
            >
                <TaskForm fetchTasks={fetchTasks} closeModal={closeFormModal} />
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
        </>
    );
};

export default NavigationBar;
