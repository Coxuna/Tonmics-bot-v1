import React, { useState } from 'react';
import ResponsivePadding from '../../components/shared/ResponsivePadding';

// TaskItem Component
const TaskItem = ({ task, onStartTask, onClaimReward }) => {
  const handleAction = () => {
    if (task.status === 'completed') {
      onClaimReward(task.id);
    } else {
      onStartTask(task.id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <div className="mr-4">
          <div className="w-10 h-10 rounded-full bg-[#132446]"></div>
        </div>
        <div>
          <div className="font-bold mb-1">{task.name}</div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-yellow-400 rounded-full mr-1"></div>
            <span>+{task.reward}</span>
          </div>
        </div>
      </div>
      <button 
        className={`px-5 py-2 rounded-lg font-bold border-none text-white uppercase ${
          task.status === 'completed' ? 'bg-green-500' : 'bg-[#132446]'
        }`}
        onClick={handleAction}
      >
        {task.status === 'completed' ? 'Claim' : 'Start'}
      </button>
    </div>
  );
};

// TasksSection Component
const TasksSection = ({ title, tasks, onStartTask, onClaimReward }) => {
  return (
    <div className="mb-8">
      <h3 className="text-2xl mb-4 text-white font-bold">{title}</h3>
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onStartTask={onStartTask} 
          onClaimReward={onClaimReward} 
        />
      ))}
    </div>
  );
};

// TasksHeader Component
const TasksHeader = ({ activeTab, onUpdateTab }) => {
  const tabs = [
    { id: 'daily', name: 'DAILY TASKS', count: 1 },
    { id: 'tasks', name: 'TASKS', count: 1 },
    { id: 'special', name: 'SPECIAL', count: 1 }
  ];

  return (
    <div className="py-5 relative">
      <h1 className="text-4xl font-bold mb-1 italic text-black drop-shadow-md">TASKS</h1>
      <h2 className="text-lg text-white mb-5 font-bold">GET REWARDS FOR COMPLETING QUESTS</h2>
      
      <div className="flex bg-[#132446] rounded-lg overflow-hidden">
        {tabs.map((tab, index) => (
          <div 
            key={index}
            className={`flex-1 text-center py-3 font-bold cursor-pointer relative ${
              activeTab === tab.id ? 'bg-white text-black' : 'text-white'
            }`}
            onClick={() => onUpdateTab(tab.id)}
          >
            {tab.name}
            {tab.count > 0 && (
              <span className="inline-flex justify-center items-center w-5 h-5 bg-red-500 text-white rounded-full text-xs ml-1">
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
  const [onboardingTasks, setOnboardingTasks] = useState([
    { id: 1, name: 'Follow us on Twitter', reward: 100, status: 'completed' },
    { id: 2, name: 'Create an account', reward: 100, status: 'pending' },
    { id: 3, name: 'Complete tutorial', reward: 150, status: 'pending' },
    { id: 4, name: 'Make first purchase', reward: 200, status: 'pending' },
    { id: 5, name: 'Refer a friend', reward: 250, status: 'pending' }
  ]);
  
  const [inGameTasks, setInGameTasks] = useState([
    { id: 6, name: 'Win 3 matches', reward: 100, status: 'pending' },
    { id: 7, name: 'Collect 5 power-ups', reward: 150, status: 'pending' }
  ]);
  
  const [specialTasks, setSpecialTasks] = useState([
    { id: 8, name: 'Special weekend event', reward: 200, status: 'pending' },
    { id: 9, name: 'Join our Discord', reward: 150, status: 'pending' }
  ]);

  const updateActiveTab = (tabId) => {
    setActiveTab(tabId);
  };

  const startTask = (taskId) => {
    // Helper function to update task status in a task list
    const updateTaskStatus = (taskList, setTaskList) => {
      const updatedTasks = taskList.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      );
      setTaskList(updatedTasks);
    };
    
    // Update task status in all lists
    updateTaskStatus(onboardingTasks, setOnboardingTasks);
    updateTaskStatus(inGameTasks, setInGameTasks);
    updateTaskStatus(specialTasks, setSpecialTasks);
  };

  const claimReward = (taskId) => {
    // Helper function to remove task from a task list
    const removeTask = (taskList, setTaskList) => {
      const updatedTasks = taskList.filter(task => task.id !== taskId);
      setTaskList(updatedTasks);
    };
    
    // Remove task from all lists
    removeTask(onboardingTasks, setOnboardingTasks);
    removeTask(inGameTasks, setInGameTasks);
    removeTask(specialTasks, setSpecialTasks);
  };

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
          <div className="absolute top-5 right-5 w-10 h-10 bg-[#132446] flex justify-center items-center rounded-lg cursor-pointer">
            <span className="text-yellow-400 text-2xl font-bold">×</span>
          </div>
          
          <TasksHeader 
            activeTab={activeTab} 
            onUpdateTab={updateActiveTab} 
          />
          
          <div className="mt-5">
            {(activeTab === 'daily' || activeTab === 'tasks') && (
              <>
                <TasksSection 
                  title="Onboarding" 
                  tasks={onboardingTasks} 
                  onStartTask={startTask} 
                  onClaimReward={claimReward} 
                />
                
                <TasksSection 
                  title="In Game" 
                  tasks={inGameTasks} 
                  onStartTask={startTask} 
                  onClaimReward={claimReward} 
                />
              </>
            )}
            
            {activeTab === 'special' && (
              <TasksSection 
                title="Special Events" 
                tasks={specialTasks} 
                onStartTask={startTask} 
                onClaimReward={claimReward} 
              />
            )}
          </div>
        </div>
      </div>
    </ResponsivePadding>
  );
};

export default TasksView;