import { createStore as reduxCreateStore, applyMiddleware, compose } from 'redux';
import reducer from './modules';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from './middleware/promiseMiddleware';

export default function createStore(initialState) {
  const store = reduxCreateStore(reducer, initialState, compose(
    applyMiddleware(
      thunkMiddleware,
      promiseMiddleware
    ),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

  return store;
}
