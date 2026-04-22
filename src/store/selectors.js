// Memoized selectors using reselect
import { createSelector } from 'reselect';

// ---- Base Selectors ----
export const selectTasksById = (state) => state.entities.tasks.byId;
export const selectTaskAllIds = (state) => state.entities.tasks.allIds;
export const selectTaskFormState = (state) => state.ui.taskForm;
export const selectFilters = (state) => state.ui.filters;
export const selectLoading = (state) => state.ui.loading;
export const selectErrors = (state) => state.ui.errors;

const selectUsersState = (state) => state.entities.users;
const selectProjectsState = (state) => state.entities.projects;

// ---- Derived Selectors ----

// All tasks as an array
export const selectAllTasks = createSelector(
  [selectTasksById, selectTaskAllIds],
  (byId, allIds) => allIds.map((id) => byId[id])
);

// All users as an array
export const selectUsers = createSelector(
  [selectUsersState],
  (usersState) => usersState.allIds.map((id) => usersState.byId[id])
);

// All projects as an array
export const selectProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.allIds.map((id) => projectsState.byId[id])
);

// Filtered tasks based on current filters
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilters],
  (tasks, filters) => {
    let filtered = [...tasks];

    if (filters.projectId) {
      filtered = filtered.filter((task) => task.projectId === filters.projectId);
    }
    if (filters.assigneeId) {
      filtered = filtered.filter((task) => task.assigneeId === filters.assigneeId);
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }
    if (filters.taskType && filters.taskType !== 'all') {
      filtered = filtered.filter((task) => task.taskType === filters.taskType);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
);

// Select a single task by ID
export const selectTaskById = (taskId) =>
  createSelector([selectTasksById], (byId) => byId[taskId] || null);
