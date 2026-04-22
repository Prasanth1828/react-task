// Root saga - combines all watcher sagas
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { mockApi } from '../../api/mockApi';

import {
  watchFetchTasks,
  watchCreateTask,
  watchUpdateTask,
  watchDeleteTask,
} from './taskSagas';

import {
  FETCH_USERS_REQUEST,
  FETCH_PROJECTS_REQUEST,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchProjectsSuccess,
  fetchProjectsFailure,
} from '../actions/taskActions';

// ---- Fetch Users Saga ----
function* fetchUsersSaga() {
  try {
    const response = yield call(mockApi.fetchUsers);
    yield put(fetchUsersSuccess(response.data));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
  }
}

// ---- Fetch Projects Saga ----
function* fetchProjectsSaga() {
  try {
    const response = yield call(mockApi.fetchProjects);
    yield put(fetchProjectsSuccess(response.data));
  } catch (error) {
    yield put(fetchProjectsFailure(error.message));
  }
}

function* watchFetchUsers() {
  yield takeLatest(FETCH_USERS_REQUEST, fetchUsersSaga);
}

function* watchFetchProjects() {
  yield takeLatest(FETCH_PROJECTS_REQUEST, fetchProjectsSaga);
}

// ---- Root Saga ----
export default function* rootSaga() {
  yield all([
    call(watchFetchTasks),
    call(watchCreateTask),
    call(watchUpdateTask),
    call(watchDeleteTask),
    call(watchFetchUsers),
    call(watchFetchProjects),
  ]);
}
