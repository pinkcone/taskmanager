import React, { useState } from 'react';
import Modal from 'react-modal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TaskDetailsModal from './TaskDetailsModal';

const Sidebar = ({ tasks, onDateClick }) => {
    const [dayTasksModalIsOpen, setDayTasksModalIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dayTasks, setDayTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);

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

    const openTaskModal = (task) => {
        setSelectedTask(task);
        setDayTasksModalIsOpen(false);
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
    };

    const onDateClickHandler = (date) => {
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
        <div>
            <Calendar
                tileContent={({ date, view }) => view === 'month' && tasks.some(task => new Date(task.dueDate).toDateString() === date.toDateString()) && (
                    <div className="highlight-tile"></div>
                )}
                tileClassName={({ date, view }) => {
                    if (view === 'month') {
                        if (tasks.some(task => new Date(task.dueDate).toDateString() === date.toDateString())) {
                            return 'highlight-tile';
                        }
                    }
                    return null;
                }}
                onClickDay={onDateClickHandler}
            />
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
                />
            )}
        </div>
    );
};

export default Sidebar;
