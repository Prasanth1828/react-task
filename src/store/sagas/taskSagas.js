// Task sagas for handling async operations
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { mockApi } from '../../api/mockApi';
import { v4 as uuidv4 } from 'uuid';

import {
  FETCH_TASKS_REQUEST,
  CREATE_TASK_REQUEST,
  UPDATE_TASK_REQUEST,
  DELETE_TASK_REQUEST,
  fetchTasksSuccess,
  fetchTasksFailure,
  createTaskSuccess,
  createTaskFailure,
  createTaskOptimistic,
  updateTaskSuccess,
  updateTaskFailure,
  updateTaskOptimistic,
  deleteTaskSuccess,
  deleteTaskFailure,
  deleteTaskOptimistic,
} from '../actions/taskActions';

// ---- Fetch Tasks ----
function* fetchTasksSaga(action) {
  try {
    const response = yield call(mockApi.fetchTasks, action.payload);
    yield put(fetchTasksSuccess(response.data));
  } catch (error) {
    yield put(fetchTasksFailure(error.message));
  }
}

// ---- Create Task (Optimistic) ----
function* createTaskSaga(action) {
  const optimisticId = `optimistic_${uuidv4()}`;
  const optimisticTask = {
    ...action.payload,
    id: optimisticId,
    createdAt: new Date().toISOString(),
    status: 'Todo',
  };

  yield put(createTaskOptimistic(optimisticTask));

  try {
    const response = yield call(mockApi.createTask, action.payload);
    yield put(createTaskSuccess(response.data));
  } catch (error) {
    yield put(createTaskFailure(error.message, optimisticId));
  }
}

// ---- Update Task (Optimistic) ----
function* updateTaskSaga(action) {
  const { taskId, updates } = action.payload;
  const state = yield select();
  const previousData = state.entities.tasks.byId[taskId];

  yield put(updateTaskOptimistic(taskId, updates));

  try {
    const response = yield call(mockApi.updateTask, taskId, updates);
    yield put(updateTaskSuccess(response.data));
  } catch (error) {
    yield put(updateTaskFailure(error.message, taskId, previousData));
  }
}

// ---- Delete Task (Optimistic) ----
function* deleteTaskSaga(action) {
  const taskId = action.payload;
  const state = yield select();
  const task = state.entities.tasks.byId[taskId];

  yield put(deleteTaskOptimistic(taskId));

  try {
    yield call(mockApi.deleteTask, taskId);
    yield put(deleteTaskSuccess(taskId));
  } catch (error) {
    yield put(deleteTaskFailure(error.message, task));
  }
}

// ---- Watcher Sagas ----
export function* watchFetchTasks() {
  yield takeLatest(FETCH_TASKS_REQUEST, fetchTasksSaga);
}

export function* watchCreateTask() {
  yield takeLatest(CREATE_TASK_REQUEST, createTaskSaga);
}

export function* watchUpdateTask() {
  yield takeLatest(UPDATE_TASK_REQUEST, updateTaskSaga);
}

export function* watchDeleteTask() {
  yield takeLatest(DELETE_TASK_REQUEST, deleteTaskSaga);
}