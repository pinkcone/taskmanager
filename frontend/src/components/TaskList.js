import React, { useState } from 'react';
import axios from 'axios';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskDetailsModal from './TaskDetailsModal'; // Import TaskDetailsModal
import '../App.css'; // Importuj plik CSS

const ItemTypes = {
    TASK: 'task',
};

const Task = ({ task, onOpenModal }) => {
    const [, drag] = useDrag({
        type: ItemTypes.TASK,
        item: { id: task._id, status: task.status },
    });

    return (
        <div ref={drag} className="task-item" onClick={() => onOpenModal(task)}>
            <h3>{task.title}</h3>
        </div>
    );
};

const TaskColumn = ({ status, children, onDropTask }) => {
    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.TASK,
        drop: (item) => onDropTask(item.id, status),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'Nie rozpoczęte':
                return 'not-started';
            case 'W trakcie':
                return 'in-progress';
            case 'Zakończone':
                return 'completed';
            default:
                return '';
        }
    };

    return (
        <div ref={drop} className={`task-column ${getStatusClass(status)}`} style={{ backgroundColor: isOver ? '#e0e0e0' : '' }}>
            <div className="task-column-title"><h2>{status}</h2></div>
            <div className="task-list">
                {children}
            </div>
        </div>
    );
};

const TaskList = ({ tasks, fetchTasks }) => {
    const [selectedTask, setSelectedTask] = useState(null);

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const response = await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            console.log(`Task ${taskId} updated:`, response.data); // Log for debugging
            fetchTasks(); // Odśwież listę zadań po aktualizacji
        } catch (err) {
            console.error(err.response.data);
        }
    };

    const renderTasks = (status) => {
        return tasks.filter(task => task.status === status).map(task => (
            <Task key={task._id} task={task} onOpenModal={setSelectedTask} />
        ));
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <TaskColumn status="Nie rozpoczęte" onDropTask={updateTaskStatus}>
                    {renderTasks('Nie rozpoczęte')}
                </TaskColumn>
                <TaskColumn status="W trakcie" onDropTask={updateTaskStatus}>
                    {renderTasks('W trakcie')}
                </TaskColumn>
                <TaskColumn status="Zakończone" onDropTask={updateTaskStatus}>
                    {renderTasks('Zakończone')}
                </TaskColumn>
            </div>
            {selectedTask && (
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    task={selectedTask}
                    closeModal={closeTaskModal}
                    fetchTasks={fetchTasks}
                />
            )}
        </DndProvider>
    );
};

export default TaskList;
