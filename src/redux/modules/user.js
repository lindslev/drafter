import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

const LOGIN_USER = 'LOGIN_USER';
const CREATE_USER = 'CREATE_USER';
const SET_PROPERTY = 'SET_PROPERTY';

function handleSetProperty(state, action) {
  return assign({}, state, action.payload);
}

const initialState = {
  usernameToCreate: null,
  passwordToCreate: null,
  usernameToLogin: null,
  passwordToLogin: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case SET_PROPERTY:
    return handleSetProperty(state, action);
  default:
    return state;
  }
}

export function setProperty(property, value) { 
  return {
    type: SET_PROPERTY,
    payload: { [property]: value }
  };
}

export function loginUser(username, password) {
  return {
    type: LOGIN_USER,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.loginUser(username, password);
      }
    }
  };
}

export function createUser(username, password) {
  return {
    type: CREATE_USER,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.createUser(username, password);
      }
    }
  };
}
