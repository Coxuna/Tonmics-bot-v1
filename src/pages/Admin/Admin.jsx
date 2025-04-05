import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });
  
  const [task, setTask] = useState({
    title: "",
    description: "",
    reward_amount: 0,
    reward_type: "t_keys", // Default reward type
    task_type: "daily", // Default task type
    requirement: "",
    external_url: "",
    is_recurring: false,
    duration_days: 1
  });
  
  const [signedIn, setSignedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 4;

  // Fetch tasks when component mounts and when signed in
  useEffect(() => {
    if (signedIn) {
      fetchTasks();
    }
  }, [signedIn]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`);
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginFormChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === "reward_amount" || name === "duration_days" ? parseInt(value) || 0 : value
    }));
  };

  const submitTaskForm = async () => {
    if (!task.title || !task.reward_amount || !task.reward_type || !task.task_type) {
      setError('Title, reward amount, reward type, and task type are required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, task);
      
      if (response.data.success) {
        // Add the new task to the list
        setTasks([...tasks, response.data.data]);
        
        // Reset form
        setTask({
          title: "",
          description: "",
          reward_amount: 0,
          reward_type: "t_keys",
          task_type: "daily",
          requirement: "",
          external_url: "",
          is_recurring: false,
          duration_days: 1
        });
        
        setError(null);
      } else {
        setError(response.data.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    if (loginForm.username === "admin" && loginForm.password === "password") {
      setSignedIn(true);
      setError(null);
    } else {
      setError("Invalid username or password");
    }
  };

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`);
      
      if (response.data.success) {
        setTasks(tasks.filter(task => task.id !== id));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshDailyTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks/refresh-daily`);
      
      if (response.data.success) {
        setError(null);
        alert(`Successfully refreshed daily tasks for ${response.data.data.usersAffected} users`);
      } else {
        setError(response.data.message || 'Failed to refresh daily tasks');
      }
    } catch (err) {
      setError('Failed to refresh daily tasks');
      console.error('Error refreshing daily tasks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get current tasks for pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Scrollable Container */}
      <div className="flex justify-center items-start overflow-auto py-4 px-4 pb-16 w-full min-h-screen">
        {/* Background Image */}
        <img
          className="fixed w-full h-full object-cover top-0 left-0 -z-10"
          src="/assets/secondbackground.webp"
          alt="Background"
        />
        
        {/* Content Container */}
        <div className="w-full max-w-4xl bg-black bg-opacity-60 rounded-lg p-6 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-gray-300">{signedIn ? 'Manage your tasks' : 'Admin Login'}</p>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="bg-red-500 bg-opacity-80 text-white p-2 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="bg-blue-500 bg-opacity-80 text-white p-2 rounded mb-4">
              Loading...
            </div>
          )}
          
          {/* Form with Explicitly Visible Inputs */}
          <div className="space-y-4">
            {signedIn ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-1">Task Title*</label>
                    <input 
                      value={task.title} 
                      onChange={handleTaskChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      type="text" 
                      name="title"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Description</label>
                    <textarea 
                      value={task.description} 
                      onChange={handleTaskChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      name="description"
                      placeholder="Enter task description"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-1">Reward Amount*</label>
                      <input 
                        value={task.reward_amount} 
                        onChange={handleTaskChange} 
                        className="w-full p-2 rounded text-white border border-gray-300" 
                        type="number" 
                        name="reward_amount"
                        min="0"
                        placeholder="Enter reward amount"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">Reward Type*</label>
                      <select
                        value={task.reward_type}
                        onChange={handleTaskChange}
                        className="w-full p-2 rounded text-white border border-gray-300"
                        name="reward_type"
                      >
                        <option value="t_keys">T-Keys</option>
                        <option value="gems">Gems</option>
                        <option value="tms_points">TMS Points</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-1">Task Type*</label>
                      <select
                        value={task.task_type}
                        onChange={handleTaskChange}
                        className="w-full p-2 rounded text-white border border-gray-300"
                        name="task_type"
                      >
                        <option value="onboarding">Onboarding</option>
                        <option value="daily">Daily</option>
                        <option value="in_game">In-Game</option>
                        <option value="special">Special</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-1">Duration (Days)</label>
                      <input 
                        value={task.duration_days} 
                        onChange={handleTaskChange} 
                        className="w-full p-2 rounded text-white border border-gray-300" 
                        type="number" 
                        name="duration_days"
                        min="1"
                        placeholder="Enter duration in days"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white mb-1">Requirement</label>
                    <input 
                      value={task.requirement} 
                      onChange={handleTaskChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      type="text" 
                      name="requirement"
                      placeholder="Enter task requirement"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">External URL</label>
                    <input 
                      value={task.external_url} 
                      onChange={handleTaskChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      type="text" 
                      name="external_url"
                      placeholder="Enter external URL"
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      checked={task.is_recurring} 
                      onChange={handleTaskChange} 
                      className="mr-2 h-4 w-4" 
                      type="checkbox" 
                      name="is_recurring"
                      id="is_recurring"
                    />
                    <label htmlFor="is_recurring" className="text-white">Is Recurring</label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={submitTaskForm}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
                    disabled={loading}
                  >
                    Add Task
                  </button>
                  <button 
                    onClick={refreshDailyTasks}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
                    disabled={loading}
                  >
                    Refresh Daily Tasks
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-1">Username</label>
                    <input 
                      value={loginForm.username} 
                      onChange={handleLoginFormChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      type="text" 
                      name="username"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-1">Password</label>
                    <input 
                      value={loginForm.password} 
                      onChange={handleLoginFormChange} 
                      className="w-full p-2 rounded text-white border border-gray-300" 
                      type="password" 
                      name="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <button 
                    onClick={login}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
                    disabled={loading}
                  >
                    Login
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Task List with Pagination */}
          {signedIn && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Current Tasks</h2>
                <div className="text-white">
                  <span>Page {currentPage} of {totalPages || 1}</span>
                </div>
              </div>
              
              {tasks.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {currentTasks.map(task => (
                      <div key={task.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium text-lg">{task.title}</div>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-blue-600 text-xs rounded text-white">
                              {task.task_type}
                            </span>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <div className="text-gray-300 text-sm mb-2">{task.description}</div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-green-400">
                            Reward: {task.reward_amount} {task.reward_type}
                          </div>
                          {task.requirement && (
                            <div className="text-yellow-400">
                              Requirement: {task.requirement}
                            </div>
                          )}
                          {task.external_url && (
                            <div className="text-blue-400 truncate">
                              URL: {task.external_url}
                            </div>
                          )}
                          {task.is_recurring && (
                            <div className="text-purple-400">
                              Recurring: {task.duration_days} days
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                      >
                        First
                      </button>
                      <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                      >
                        Prev
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {[...Array(totalPages).keys()].map(number => (
                          <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={`px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                          >
                            {number + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`px-3 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                      >
                        Next
                      </button>
                      <button 
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`px-3 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-center italic">
                  {loading ? 'Loading tasks...' : 'No tasks available'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;