import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = ({ fetchTasks, closeModal, task }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        category: '',
        status: 'Nie rozpoczęte'
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
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

    const { title, dueDate, priority, category, status } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            if (task) {
                // Update existing task
                await axios.put(`/api/tasks/${task._id}`, formData, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
            } else {
                // Add new task
                await axios.post('/api/tasks', formData, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
            }
            fetchTasks();
            closeModal();
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <form onSubmit={e => onSubmit(e)}>
            <h2>Dodaj nowe zadanie</h2>
            <div className="form-group">
                <label htmlFor="title">Tytuł</label>
                <input type="text" name="title" value={title} onChange={e => onChange(e)} required />
            </div>
            <div className="form-group description">
                <label htmlFor="description">Opis</label>
                
                            <textarea
                                
                                name="description"
                                onChange={handleChange}
                                style={{ resize: 'none', overflow: 'auto' }}
                                rows={4}
                                maxLength={500} // Optional: to limit the number of characters
                                required
                            />
                        
            </div>
            <div className="form-group">
                <label htmlFor="dueDate">Data końcowa</label>
                <input type="date" name="dueDate" value={dueDate} onChange={e => onChange(e)} required />
            </div>
            <div className="form-group">
                <label htmlFor="priority">Priorytet</label>
                <select name="priority" value={priority} onChange={e => onChange(e)} required>
                    <option value="Low">Niski</option>
                    <option value="Medium">Średni</option>
                    <option value="High">Wysoki</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="category">Kategoria</label>
                <input type="text" name="category" value={category} onChange={e => onChange(e)} required />
            </div>
            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select name="status" value={status} onChange={e => onChange(e)} required>
                    <option value="Nie rozpoczęte">Nie rozpoczęte</option>
                    <option value="W trakcie">W trakcie</option>
                    <option value="Zakończone">Zakończone</option>
                </select>
            </div>
            <button type="submit">{task ? 'Update Task' : 'Add Task'}</button>
            <button type="button" onClick={closeModal}>Anuluj</button>
        </form>
    );
};

export default TaskForm;
