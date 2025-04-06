import React, { useState, useEffect } from 'react';
import ResponsivePadding from '../../components/shared/ResponsivePadding';
import { useNavigate } from 'react-router';
import { useUser } from '../../hooks/UserProvider';
import TaskRewardToast from '../../components/Task/TaskRewardToast';
// TaskItem Component
const TaskItem = ({ task, onStartTask, onClaimReward, onCompleteAndClaimTask, completeTask }) => {
  const handleAction = () => {
    if (task.status === 'completed') {
      onClaimReward(task.id || task.user_task_id);
    } else if (task.status === 'claimed') {
      // Do nothing for already claimed tasks
    } else if (task.external_url) {
      window.open(task.external_url, '_blank');
      completeTask(task.id || task.user_task_id);
    } else {
      onStartTask(task.id || task.user_task_id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <div className="mr-4">
          <div className="w-10 h-10 rounded-full bg-[#132446]"></div>
        </div>
        <div>
          <div className="font-bold mb-1">{task.title}</div>
          <div className="text-sm text-gray-600 mb-2">{task.description}</div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-400 rounded-full mr-1"></div>
            <span>+{task.reward_amount} {task.reward_type}</span>
          </div>
          {task.expires_at && (
            <div className="text-xs text-red-500 mt-1">
              Expires: {new Date(task.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      <button 
      className={`px-5 py-2 rounded-lg font-bold border-none text-white uppercase ${
        task.status === 'claimed' ? 'bg-green-500' : 
        task.status === 'completed' ? 'bg-yellow-500' :
        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-[#132446]'
      }`}
      onClick={handleAction}
    >
      {task.status === 'claimed' ? 'Claimed' : 
       task.status === 'completed' ? 'Claim Reward' : 
       task.status === 'in_progress' ? 'Continue' : 'Start'}
    </button>
    </div>
  );
};

// TasksSection Component
const TasksSection = ({ title, tasks, onStartTask, onClaimReward , onCompleteAndClaimTask, completeTask }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-2xl mb-4 text-white font-bold">{title}</h3>
        <div className="bg-white rounded-xl p-4 mb-4 text-center shadow-md">
          No tasks available
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
    <h3 className="text-2xl mb-4 text-white font-bold">{title}</h3>
    {tasks.map(task => (
      <TaskItem 
        key={task.id || task.user_task_id} 
        task={task} 
        onStartTask={onStartTask} 
        onClaimReward={onClaimReward}
        onCompleteAndClaimTask={onCompleteAndClaimTask}
        completeTask={completeTask}
      />
    ))}
  </div>
  );
};

// TasksHeader Component
const TasksHeader = ({ activeTab, onUpdateTab, taskCounts }) => {
  const tabs = [
    { id: 'daily', name: 'DAILY TASKS', count: taskCounts.daily || 0 },
    { id: 'onboarding', name: 'ONBOARDING', count: taskCounts.onboarding || 0 },
    { id: 'in_game', name: 'IN GAME', count: taskCounts.in_game || 0 },
    { id: 'special', name: 'SPECIAL', count: taskCounts.special || 0 }
  ];

  return (
    <div className="py-5 relative">
      <h1 className="text-4xl font-bold mb-1 italic text-black drop-shadow-md">TASKS</h1>
      <h2 className="text-lg text-white mb-5 font-bold">GET REWARDS FOR COMPLETING QUESTS</h2>
      
      <div className="flex flex-wrap bg-[#132446] rounded-lg overflow-hidden">
        {tabs.map((tab, index) => (
          <div 
            key={index}
            className={`flex-1 text-center py-3 font-bold cursor-pointer relative ${
              activeTab === tab.id ? 'bg-white text-black' : 'text-white'
            }`}
            onClick={() => onUpdateTab(tab.id)}
          >
            <div className="whitespace-nowrap px-2">{tab.name}</div>
            {tab.count > 0 && (
              <span className="inline-flex justify-center items-center w-5 h-5 bg-red-500 text-white rounded-full text-xs absolute top-1 right-1">
                {tab.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main TasksView Component
const TasksView = () => {
const [activeTab, setActiveTab] = useState('daily');
const navigate = useNavigate()
  const [tasks, setTasks] = useState({
    daily: [],
    onboarding: [],
    in_game: [],
    special: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskCounts, setTaskCounts] = useState({
    daily: 0,
    onboarding: 0,
    in_game: 0,
    special: 0
  });
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState({
    rewardAmount: 0,
    rewardType: ''
  });

  const {user, fetchUser} = useUser()
  const [telegram_id, setTelegramId] = useState(null); // Initialize with mock value

  useEffect(() => {
    if (user && user.telegram_id) {
      setTelegramId(user.telegram_id);
      console.log("Updated telegram_id:", user.telegram_id);
    }
  }, [user]);


// Update your useEffect to only fetch tasks when telegram_id is available
useEffect(() => {
  if (telegram_id) {
    fetchUserTasks();
  }
}, [telegram_id]); // Depend on telegram_id instead of user

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-tasks?telegram_id=${telegram_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // The backend returns tasks grouped by type
        setTasks({
          daily: data.data.daily || [],
          onboarding: data.data.onboarding || [],
          in_game: data.data.in_game || [],
          special: data.data.special || []
        });
        
        // Set counts for the tabs
        setTaskCounts({
          daily: (data.data.daily || []).length,
          onboarding: (data.data.onboarding || []).length,
          in_game: (data.data.in_game || []).length,
          special: (data.data.special || []).length
        });
      } else {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/start-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id,
          task_id: taskId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start task');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state to reflect the task's new status
        updateTaskStatus(taskId, 'in_progress');
      } else {
        throw new Error(data.message || 'Failed to start task');
      }
    } catch (err) {
      console.error('Error starting task:', err);
      // Show error to user (could add toast notification here)
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/complete-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id,
          task_id: taskId,
          progress: 100
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete task');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state to reflect the task's new status
        updateTaskStatus(taskId, 'completed');
      } else {
        throw new Error(data.message || 'Failed to complete task');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      // Show error to user
    }
  };

  const claimReward = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/claim-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id,
          task_id: taskId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to claim reward');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the task from the UI
      //  removeTask(taskId);
      updateTaskStatus(taskId, 'claimed');
      setToastData({
        rewardAmount: data.data.reward.rewardAmount,
        rewardType: data.data.reward.rewardType
      });
      
      
      setToastVisible(true);
        
       
      } else {
        throw new Error(data.message || 'Failed to claim reward');
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      // Show error to user
    }
  };

  const completeAndClaimTask = async (taskId) => {
    try {
      // First complete the task
      const completeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/complete-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id,
          task_id: taskId,
          progress: 0
        })
      });
      
      if (!completeResponse.ok) {
        throw new Error('Failed to complete task');
      }
      
      const completeData = await completeResponse.json();
      
      if (completeData.success) {
        // Update local state to reflect task completion
        updateTaskStatus(taskId, 'completed');
        
        // Then immediately claim the reward
        const claimResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/claim-task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telegram_id,
            task_id: taskId
          })
        });
        
        if (!claimResponse.ok) {
          throw new Error('Failed to claim reward');
        }
        
        const claimData = await claimResponse.json();
        
        if (claimData.success) {
          // Remove the task from the UI
          //removeTask(taskId);

         
          setToastData({
            rewardAmount: claimData.data.reward.rewardAmount,
            rewardType:  claimData.data.reward.rewardType
          });
          setToastVisible(true);
       
          
         
        } else {
          throw new Error(claimData.message || 'Failed to claim reward');
        }
      } else {
        throw new Error(completeData.message || 'Failed to complete task');
      }
    } catch (err) {
      console.error('Error completing and claiming task:', err);
      // Show error to user
    }
  };
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      
      Object.keys(prevTasks).forEach(type => {
        updatedTasks[type] = prevTasks[type].map(task => 
          (task.id === taskId || task.user_task_id === taskId) 
            ? { ...task, status: newStatus } 
            : task
        );
      });
      
      return updatedTasks;
    });
  };

  const removeTask = (taskId) => {
    setTasks(prevTasks => {
      const updatedTasks = {};
      
      Object.keys(prevTasks).forEach(type => {
        updatedTasks[type] = prevTasks[type].filter(task => 
          task.id !== taskId && task.user_task_id !== taskId
        );
      });
      
      // Update counts
      setTaskCounts({
        daily: updatedTasks.daily.length,
        onboarding: updatedTasks.onboarding.length,
        in_game: updatedTasks.in_game.length,
        special: updatedTasks.special.length
      });
      
      return updatedTasks;
    });
  };

  const updateActiveTab = (tabId) => {
    setActiveTab(tabId);
  };

  const handleNavigateHome = () => {
  
    navigate('/Home');
    window.location.reload();
  };
  const handleCloseToast = () => {
    setToastVisible(false);
  };

  if (loading) {
    return (
      <ResponsivePadding>
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading tasks...</div>
        </div>
      </ResponsivePadding>
    );
  }

  if (error) {
    return (
      <ResponsivePadding>
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </ResponsivePadding>
    );
  }

  return (
    <ResponsivePadding>
      <div className="flex justify-center items-start overflow-auto py-4 px-4 pb-16 w-full min-h-screen">
        {/* Background Image */}
        <img
          className="fixed w-full h-full object-cover top-0 left-0 -z-10"
          src="/assets/secondbackground.webp"
          alt="Background"
        />
        
        <div className="relative max-w-3xl w-full bg-orange-400/60 bg-opacity-60 rounded-xl shadow-lg p-6">
        <div onClick={handleNavigateHome} className="absolute top-5 right-5 w-10 h-10 bg-[#132446] flex justify-center items-center rounded-lg cursor-pointer z-10">
  <span className="text-yellow-400 text-2xl font-bold">×</span>
</div>
          
          <TasksHeader 
            activeTab={activeTab} 
            onUpdateTab={updateActiveTab}
            taskCounts={taskCounts}
          />
          
          <div className="mt-5">
          {activeTab === 'daily' && (
  <TasksSection 
    title="Daily Tasks" 
    tasks={tasks.daily} 
    onStartTask={startTask} 
    onClaimReward={claimReward}
    onCompleteAndClaimTask={completeAndClaimTask} 
    completeTask={completeTask}

  />
)}


            
            {activeTab === 'onboarding' && (
              <TasksSection 
                title="Onboarding Tasks" 
                tasks={tasks.onboarding} 
                onStartTask={startTask} 
                onClaimReward={claimReward} 
                onCompleteAndClaimTask={completeAndClaimTask} 
                completeTask={completeTask}
              />
            )}
            
            {activeTab === 'in_game' && (
              <TasksSection 
                title="In-Game Tasks" 
                tasks={tasks.in_game} 
                onStartTask={startTask} 
                onClaimReward={claimReward} 
                onCompleteAndClaimTask={completeAndClaimTask} 
                completeTask={completeTask}
              />
            )}
            
            {activeTab === 'special' && (
              <TasksSection 
                title="Special Tasks" 
                tasks={tasks.special} 
                onStartTask={startTask} 
                onClaimReward={claimReward} 
                onCompleteAndClaimTask={completeAndClaimTask} 
                completeTask={completeTask}
              />
            )}
          </div>
        </div>
     
        <TaskRewardToast
          isVisible={toastVisible}
          rewardAmount={toastData.rewardAmount}
          rewardType={toastData.rewardType}
          message="Task Completed!"
          message2="Keep completing tasks to earn rewards"
          onClose={handleCloseToast}
        />
     
      </div>
    </ResponsivePadding>
  );
};

export default TasksView;