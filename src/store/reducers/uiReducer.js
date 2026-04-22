// UI Reducer - Manages form state, filters, loading, and errors
import {
  OPEN_TASK_FORM,
  CLOSE_TASK_FORM,
  SET_FORM_MODE,
  SET_FILTERS,
  CLEAR_FILTERS,
  SET_SEARCH,
  SET_LOADING,
  SET_ERROR,
  CLEAR_ERROR,
} from '../actions/uiActions';

import {
  FETCH_TASKS_REQUEST,
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILURE,
  CREATE_TASK_REQUEST,
  CREATE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  UPDATE_TASK_REQUEST,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAILURE,
  DELETE_TASK_REQUEST,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAILURE,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_PROJECTS_REQUEST,
  FETCH_PROJECTS_SUCCESS,
  FETCH_PROJECTS_FAILURE,
} from '../actions/taskActions';

const initialState = {
  taskForm: {
    isOpen: false,
    mode: 'create',
    taskId: null,
  },
  filters: {
    projectId: null,
    assigneeId: null,
    status: 'all',
    taskType: 'all',
    search: '',
  },
  loading: {
    tasks: false,
    users: false,
    projects: false,
  },
  errors: {
    tasks: null,
    users: null,
    projects: null,
    form: null,
  },
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    // ---- Task Form ----
    case OPEN_TASK_FORM:
      return {
        ...state,
        taskForm: {
          isOpen: true,
          mode: action.payload.mode,
          taskId: action.payload.taskId,
        },
      };

    case CLOSE_TASK_FORM:
      return {
        ...state,
        taskForm: {
          isOpen: false,
          mode: 'create',
          taskId: null,
        },
        errors: { ...state.errors, form: null },
      };

    case SET_FORM_MODE:
      return {
        ...state,
        taskForm: {
          ...state.taskForm,
          mode: action.payload.mode,
          taskId: action.payload.taskId,
        },
      };

    // ---- Filters ----
    case SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };

    case SET_SEARCH:
      return {
        ...state,
        filters: { ...state.filters, search: action.payload },
      };

    // ---- Loading & Errors for Tasks ----
    case FETCH_TASKS_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, tasks: true },
        errors: { ...state.errors, tasks: null },
      };
    case FETCH_TASKS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
      };
    case FETCH_TASKS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, tasks: action.payload },
      };

    case CREATE_TASK_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, tasks: true },
        errors: { ...state.errors, form: null },
      };
    case CREATE_TASK_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        taskForm: { isOpen: false, mode: 'create', taskId: null },
      };
    case CREATE_TASK_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, form: action.payload.error },
      };

    case UPDATE_TASK_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, tasks: true },
        errors: { ...state.errors, form: null },
      };
    case UPDATE_TASK_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        taskForm: { isOpen: false, mode: 'create', taskId: null },
      };
    case UPDATE_TASK_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, form: action.payload.error },
      };

    case DELETE_TASK_REQUEST:
      return {
        ...state,
        loading: { ...state.loading, tasks: true },
      };
    case DELETE_TASK_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
      };
    case DELETE_TASK_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        errors: { ...state.errors, tasks: action.payload.error },
      };

    // ---- Users ----
    case FETCH_USERS_REQUEST:
      return { ...state, loading: { ...state.loading, users: true } };
    case FETCH_USERS_SUCCESS:
      return { ...state, loading: { ...state.loading, users: false } };
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, users: false },
        errors: { ...state.errors, users: action.payload },
      };

    // ---- Projects ----
    case FETCH_PROJECTS_REQUEST:
      return { ...state, loading: { ...state.loading, projects: true } };
    case FETCH_PROJECTS_SUCCESS:
      return { ...state, loading: { ...state.loading, projects: false } };
    case FETCH_PROJECTS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, projects: false },
        errors: { ...state.errors, projects: action.payload },
      };

    // ---- Generic ----
    case SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.isLoading },
      };
    case SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error },
      };
    case CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null },
      };

    default:
      return state;
  }
};

export default uiReducer;
