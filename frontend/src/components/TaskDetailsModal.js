import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const TaskDetailsModal = ({ isOpen, task, closeModal, fetchTasks, reloadOnUpdate }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: '',
        category: '',
        status: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate.split('T')[0], // Ensure it's in 'YYYY-MM-DD' format for the date input
                priority: task.priority,
                category: task.category,
                status: task.status
            });
        }
    }, [task]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = async () => {
        try {
            const response = await axios.put(`/api/tasks/${task._id}`, formData, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            if (response && response.data) {
                console.log(`Task ${task._id} updated:`, response.data);
                fetchTasks();
                closeModal();
                if (reloadOnUpdate) {
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`/api/tasks/${task._id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') },
            });
            if (response && response.data) {
                console.log(`Task ${task._id} deleted:`, response.data);
                fetchTasks();
                closeModal();
                if (reloadOnUpdate) {
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'Low':
                return 'low-priority';
            case 'Medium':
                return 'medium-priority';
            case 'High':
                return 'high-priority';
            default:
                return '';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Task Details"
            className={`modal-content ${getPriorityClass(formData.priority)}`}
            overlayClassName="modal-overlay"
        >
            <button onClick={closeModal} className="close-button">
                <FontAwesomeIcon icon={faTimes} />
            </button>
            {editMode ? (
                <div>
                    <h2>Edytuj zadanie</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="title">Tytuł</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="form-group description">
                            <label htmlFor="description">Opis</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                style={{ resize: 'none', overflow: 'auto' }}
                                rows={1}
                                maxLength={500}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dueDate">Data końcowa</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority">Priorytet</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="Low">Niski</option>
                                <option value="Medium">Średni</option>
                                <option value="High">Wysoki</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Kategoria</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Nie rozpoczęte">Nie rozpoczęte</option>
                                <option value="W trakcie">W trakcie</option>
                                <option value="Zakończone">Zakończone</option>
                            </select>
                        </div>
                        <div className='task-buttons'>
                            <button type="button" onClick={handleUpdate}>Zaktualizuj</button>
                            <button type="button" onClick={() => setEditMode(false)}>Cofnij zmiany</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className='task-detail'>
                    <div className='task-meta'>
                        <p>Data końcowa: {new Date(task.dueDate).toLocaleDateString('pl-PL')}</p>
                        <p>Priorytet: {task.priority}</p>
                    </div>
                    <h2>{task.title}</h2>
                    <div className='task-desc'>
                        <p>{task.description}</p>
                    </div>
                    <p>Kategoria: {task.category}</p>
                    <div className='task-buttons'>
                        <button className='edit' onClick={() => setEditMode(true)}>Edytuj</button>
                        <button className='delete' onClick={handleDelete}>Usuń</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default TaskDetailsModal;
