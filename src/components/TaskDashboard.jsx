// Main Dashboard Component - Connected to Redux
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import FilterBar from './FilterBar';

import {
  selectFilteredTasks,
  selectUsers,
  selectProjects,
  selectTaskFormState,
  selectFilters,
  selectLoading,
  selectErrors,
} from '../store/selectors';

import {
  fetchTasksRequest,
  fetchUsersRequest,
  fetchProjectsRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from '../store/actions/taskActions';

import {
  openTaskForm,
  closeTaskForm,
  setFilters,
} from '../store/actions/uiActions';

const TaskDashboard = () => {
  const dispatch = useDispatch();

  // Connect to Redux state
  const tasks = useSelector(selectFilteredTasks);
  const users = useSelector(selectUsers);
  const projects = useSelector(selectProjects);
  const taskForm = useSelector(selectTaskFormState);
  const filters = useSelector(selectFilters);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);

  // Fetch initial data on mount
  useEffect(() => {
    dispatch(fetchTasksRequest());
    dispatch(fetchUsersRequest());
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  // Get initial data for edit mode
  const allTasksById = useSelector((state) => state.entities.tasks.byId);
  const editTaskData = taskForm.taskId ? allTasksById[taskForm.taskId] : null;

  // Event handlers
  const handleCreateTask = () => {
    dispatch(openTaskForm('create'));
  };

  const handleEditTask = (taskId) => {
    dispatch(openTaskForm('edit', taskId));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTaskRequest(taskId));
    }
  };

  const handleFormSubmit = (formData) => {
    if (taskForm.mode === 'create') {
      dispatch(createTaskRequest(formData));
    } else {
      dispatch(updateTaskRequest(taskForm.taskId, formData));
    }
  };

  const handleFormClose = () => {
    localStorage.removeItem('taskFormAutoSave');
    dispatch(closeTaskForm());
  };

  const handleFiltersChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  return (
    <div className="task-dashboard">
      <header className="dashboard-header">
        <h1>Task Management Dashboard</h1>
        <button 
          className="create-task-btn"
          onClick={handleCreateTask}
        >
          + Create Task
        </button>
      </header>

      {/* Error banner */}
      {errors.tasks && (
        <div className="error-banner">
          Error: {errors.tasks}
        </div>
      )}

      <FilterBar
        filters={filters}
        projects={projects}
        users={users}
        onFiltersChange={handleFiltersChange}
      />

      <TaskList
        tasks={tasks}
        loading={loading.tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskForm
        isOpen={taskForm.isOpen}
        mode={taskForm.mode}
        initialData={editTaskData}
        users={users}
        projects={projects}
        loading={loading.tasks}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default TaskDashboard;