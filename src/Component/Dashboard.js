import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
    const [data1, setData1] = useState([]);
    const [to, setTo] = useState({});
    const [user, setUserData] = useState(null);
    const { userId } = useParams();
    const intervals = useRef({});

    
    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('user'));
        if (storedUserData) {
            setUserData(storedUserData);  
        }

        const storedData = JSON.parse(localStorage.getItem('todoList')) || [];
        setData1(storedData);
        
    }, [userId]);

    useEffect(() => {
        if (data1.length > 0) {
            localStorage.setItem('todoList', JSON.stringify(data1));
        }
    }, [data1]);

    const deleteData = (id) => {
        const taskToDelete = data1.find(task => task.id === id);
        if (!taskToDelete.permissions.includes(user.username)) {
            toast.error("You do not have permission to delete this task.");
            return;
        }
        clearInterval(intervals.current[id]);
        const newData = data1.filter(v => v.id !== id);
        setData1(newData);
        toast.error("Task deleted");
    };

    const completeTask = (id) => {
        const taskToComplete = data1.find(task => task.id === id);
        if (!taskToComplete.permissions.includes(user.username)) {
            toast.error("You are not authorized to complete this task.");
            return;
        }
        clearInterval(intervals.current[id]);
        const updatedData = data1.map(task =>
            task.id === id ? { ...task, isCompleted: true } : task
        );
        setData1(updatedData);
        toast.success("Task completed!");
    };

    const setReminder = (task) => {
        toast.info(`Task due on: ${task.endDate}`);
    };

    const getValue = (e) => {
        const { name, value } = e.target;
        setTo({ ...to, [name]: value });
    };

    const calculateElapsedTime = (startDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const elapsedMs = now - start;
        const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const Tododata = (e) => {
        e.preventDefault();
        const obj = {
            task: e.target.task.value,
            taskdetail: e.target.taskdetail.value,
            startDate: new Date().toISOString(),
            endDate: e.target.endDate.value,
            id: Math.round(Math.random() * 1000),
            isCompleted: false,
            elapsedTime: "0:00:00",
            assignedTo: e.target.assignedTo.value, // Assigned user
            permissions: [user.username] // Start with the user who created the task
        };
        setData1([...data1, obj]);

        intervals.current[obj.id] = setInterval(() => {
            setData1(prevData =>
                prevData.map(task =>
                    task.id === obj.id
                        ? { ...task, elapsedTime: calculateElapsedTime(task.startDate) }
                        : task
                )
            );
        }, 1000);

        toast.success("Task added successfully!");
        
      
      
        toast.info(`Task assigned to ${obj.assignedTo}`);
        e.target.reset();
    };

    const addUserPermission = (id) => {
        const updatedData = data1.map(task => {
            if (task.id === id && !task.permissions.includes(user.username)) {
                return { ...task, permissions: [...task.permissions, user.username] };
            }
            return task;
        });
        setData1(updatedData);
        toast.success(`${user.username} has been added to the task permissions.`);
    };

    return (
        <div style={styles.container}>
            <div>
                {user ? (
                    <h1>Welcome to your dashboard, {user.username}!</h1>  
                ) : (
                    <h1>Loading your dashboard...</h1>
                )}
            </div>

            <h1 style={styles.title}>Task Manager</h1>

            {/* Task Input Form */}
            <form method="post" onSubmit={Tododata} style={styles.form}>
                <table border={1} cellPadding="10px" style={styles.table}>
                    <tbody>
                        <tr>
                            <td>Task Title:</td>
                            <td>
                                <textarea name="task" style={styles.textarea} onChange={getValue} />
                            </td>
                        </tr>
                        <tr>
                            <td>Task Details:</td>
                            <td>
                                <textarea name="taskdetail" style={styles.textarea} onChange={getValue} />
                            </td>
                        </tr>
                        <tr>
                            <td>End Date:</td>
                            <td>
                                <input type="date" name="endDate" style={styles.input} onChange={getValue} />
                            </td>
                        </tr>
                        <tr>
                            <td>Assign To:</td>
                            <td>
                                <input type="text" name="assignedTo" style={styles.input} onChange={getValue} />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={styles.submitRow}>
                                <input type="submit" style={styles.submitButton} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>

            {/* Display Task List */}
            <div style={styles.taskList}>
                {data1.length === 0 ? (
                    <h3 style={styles.noTasks}>No tasks added yet.</h3>
                ) : (
                    data1.map((v, i) => (
                        <div key={i} style={styles.taskCard}>
                            <div style={styles.taskHeader}>
                                <span style={styles.taskLabel}>Task</span>
                                <button onClick={() => deleteData(v.id)} style={styles.deleteButton}>❌</button>
                            </div>
                            <h2 style={styles.taskTitle}>
                                <span>🏴</span>{v.task}
                            </h2>
                            <h4 style={styles.taskDetails}>Task Details: {v.taskdetail}</h4>
                            <h4>Assigned To: {v.assignedTo}</h4>
                            <div style={styles.taskInfo}>
                                <span>Start: {new Date (v.startDate).toLocaleString()}</span>
                                <span style={styles.dueDate}>Due: {v.endDate}</span>
                            </div>
                            <div style={styles.taskTime}>
                                <span style={styles.elapsedTime}>{v.elapsedTime}</span>
                            </div>
                            <div style={styles.taskActions}>
                                <button onClick={() => completeTask(v.id)} style={styles.completeButton}>Complete</button>
                                <button onClick={() => setReminder(v)} style={styles.remindButton}>Remind</button>
                                <button onClick={() => addUserPermission(v.id)} style={styles.addUserButton}>Add Me</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ToastContainer />
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    title: {
        textAlign: 'center',
        color: '#333',
    },
    form: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#e3f2fd',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    textarea: {
        width: '100%',
        height: '60px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    input: {
        width: '100%',
        height: '35px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    submitRow: {
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
    },
    taskList: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px',
    },
    taskCard: {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '487px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    taskHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        marginBottom: '10px',
    },
    taskLabel: {
        backgroundColor: '#4CAF50',
        padding: '5px 15px',
        borderRadius: '10px',
        color: '#fff',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#333',
        fontSize: '18px',
        cursor: 'pointer',
    },
    taskTitle: {
        marginBottom: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    taskDetails: {
        marginBottom: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    taskInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    dueDate: {
        backgroundColor: '#4CAF50',
        padding: '5px 15px',
        borderRadius: '10px',
        color: '#fff',
        fontWeight: 'bold',
    },
    taskTime: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    elapsedTime: {
        backgroundColor: '#F44336',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '5px',
    },
    taskActions: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1,
    },
    remindButton: {
        backgroundColor: '#FFC107',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        flex: 1,
    },
    noTasks: {
        textAlign: 'center',
        color: '#999',
    },
};

export default Dashboard;
