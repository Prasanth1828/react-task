// Redux store configuration with saga middleware
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

import tasksReducer from './reducers/tasksReducer';
import uiReducer from './reducers/uiReducer';
import rootSaga from './sagas/rootSaga';

// Combine reducers with normalized state structure
const rootReducer = combineReducers({
  entities: tasksReducer,
  ui: uiReducer,
});

const sagaMiddleware = createSagaMiddleware();

// Configure Redux Logger
const logger = createLogger({
  collapsed: true,
  diff: true,
  duration: true,
  timestamp: true,
  level: 'info',
  logErrors: true,
  predicate: (getState, action) => {
    return process.env.NODE_ENV === 'development';
  }
});

// Configure Redux DevTools Extension
const composeEnhancers = 
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25
      })
    : compose;

// Create and configure store
const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      sagaMiddleware,
      logger
    )
  )
);

// Run root saga
sagaMiddleware.run(rootSaga);

export default store;