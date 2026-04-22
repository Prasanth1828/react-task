// Tasks Reducer - Normalized state structure
import {
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILURE,
  CREATE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  CREATE_TASK_OPTIMISTIC,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAILURE,
  UPDATE_TASK_OPTIMISTIC,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAILURE,
  DELETE_TASK_OPTIMISTIC,
  FETCH_USERS_SUCCESS,
  FETCH_PROJECTS_SUCCESS,
} from '../actions/taskActions';

const initialState = {
  tasks: {
    byId: {},
    allIds: [],
  },
  users: {
    byId: {},
    allIds: [],
  },
  projects: {
    byId: {},
    allIds: [],
  },
  optimistic: {
    pendingCreates: [],
    pendingUpdates: {},
    pendingDeletes: [],
  },
};

// Helper to normalize an array into byId / allIds
const normalizeArray = (array) => {
  const byId = {};
  const allIds = [];
  array.forEach((item) => {
    byId[item.id] = item;
    allIds.push(item.id);
  });
  return { byId, allIds };
};

const tasksReducer = (state = initialState, action) => {
  switch (action.type) {
    // ---- FETCH ----
    case FETCH_TASKS_SUCCESS: {
      const normalized = normalizeArray(action.payload);
      return {
        ...state,
        tasks: normalized,
      };
    }

    case FETCH_TASKS_FAILURE: {
      return state;
    }

    // ---- CREATE (Optimistic) ----
    case CREATE_TASK_OPTIMISTIC: {
      const task = action.payload;
      return {
        ...state,
        tasks: {
          byId: { ...state.tasks.byId, [task.id]: task },
          allIds: [...state.tasks.allIds, task.id],
        },
        optimistic: {
          ...state.optimistic,
          pendingCreates: [...state.optimistic.pendingCreates, task.id],
        },
      };
    }

    case CREATE_TASK_SUCCESS: {
      const newTask = action.payload;
      const optimisticId = state.optimistic.pendingCreates[state.optimistic.pendingCreates.length - 1];
      const newById = { ...state.tasks.byId };
      delete newById[optimisticId];
      newById[newTask.id] = newTask;

      const newAllIds = state.tasks.allIds
        .filter((id) => id !== optimisticId)
        .concat(newTask.id);

      return {
        ...state,
        tasks: { byId: newById, allIds: newAllIds },
        optimistic: {
          ...state.optimistic,
          pendingCreates: state.optimistic.pendingCreates.filter((id) => id !== optimisticId),
        },
      };
    }

    case CREATE_TASK_FAILURE: {
      const { optimisticId } = action.payload;
      const rolledBackById = { ...state.tasks.byId };
      delete rolledBackById[optimisticId];
      return {
        ...state,
        tasks: {
          byId: rolledBackById,
          allIds: state.tasks.allIds.filter((id) => id !== optimisticId),
        },
        optimistic: {
          ...state.optimistic,
          pendingCreates: state.optimistic.pendingCreates.filter((id) => id !== optimisticId),
        },
      };
    }

    // ---- UPDATE (Optimistic) ----
    case UPDATE_TASK_OPTIMISTIC: {
      const { taskId, updates } = action.payload;
      const previousData = state.tasks.byId[taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byId: {
            ...state.tasks.byId,
            [taskId]: { ...previousData, ...updates },
          },
        },
        optimistic: {
          ...state.optimistic,
          pendingUpdates: {
            ...state.optimistic.pendingUpdates,
            [taskId]: previousData,
          },
        },
      };
    }

    case UPDATE_TASK_SUCCESS: {
      const updatedTask = action.payload;
      const pendingUpdates = { ...state.optimistic.pendingUpdates };
      delete pendingUpdates[updatedTask.id];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byId: { ...state.tasks.byId, [updatedTask.id]: updatedTask },
        },
        optimistic: {
          ...state.optimistic,
          pendingUpdates,
        },
      };
    }

    case UPDATE_TASK_FAILURE: {
      const { taskId, previousData } = action.payload;
      const pendingUpdates = { ...state.optimistic.pendingUpdates };
      delete pendingUpdates[taskId];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          byId: { ...state.tasks.byId, [taskId]: previousData },
        },
        optimistic: {
          ...state.optimistic,
          pendingUpdates,
        },
      };
    }

    // ---- DELETE (Optimistic) ----
    case DELETE_TASK_OPTIMISTIC: {
      const taskId = action.payload;
      return {
        ...state,
        tasks: {
          byId: { ...state.tasks.byId },
          allIds: state.tasks.allIds.filter((id) => id !== taskId),
        },
        optimistic: {
          ...state.optimistic,
          pendingDeletes: [...state.optimistic.pendingDeletes, taskId],
        },
      };
    }

    case DELETE_TASK_SUCCESS: {
      const taskId = action.payload;
      const newById = { ...state.tasks.byId };
      delete newById[taskId];
      return {
        ...state,
        tasks: {
          byId: newById,
          allIds: state.tasks.allIds.filter((id) => id !== taskId),
        },
        optimistic: {
          ...state.optimistic,
          pendingDeletes: state.optimistic.pendingDeletes.filter((id) => id !== taskId),
        },
      };
    }

    case DELETE_TASK_FAILURE: {
      const { task } = action.payload;
      return {
        ...state,
        tasks: {
          byId: { ...state.tasks.byId, [task.id]: task },
          allIds: [...state.tasks.allIds, task.id],
        },
        optimistic: {
          ...state.optimistic,
          pendingDeletes: state.optimistic.pendingDeletes.filter((id) => id !== task.id),
        },
      };
    }

    // ---- USERS ----
    case FETCH_USERS_SUCCESS: {
      return {
        ...state,
        users: normalizeArray(action.payload),
      };
    }

    // ---- PROJECTS ----
    case FETCH_PROJECTS_SUCCESS: {
      return {
        ...state,
        projects: normalizeArray(action.payload),
      };
    }

    default:
      return state;
  }
};

export default tasksReducer;
