import { createStore as reduxCreateStore, applyMiddleware } from 'redux';
import reducer from './modules';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from './middleware/promiseMiddleware';

export default function createStore(initialState) {
  const createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    promiseMiddleware
  )(reduxCreateStore);

  return createStoreWithMiddleware(reducer, initialState);
}
