import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

const RECEIVE_CHAT_MESSAGE = 'CHAT_MESSAGE';
const SET_PROPERTY = 'SET_PROPERTY';

function handleChatMessage(state, { payload }) {
  const newStream = state.stream;
  newStream.unshift(payload);
  return assign({}, state, { stream: newStream });
}

function handleSetProperty(state, action) {
  return assign({}, state, action.payload);
}

const initialState = {
  stream: [],
  userChatMessage: ''
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case SET_PROPERTY:
    return handleSetProperty(state, action);
  case RECEIVE_CHAT_MESSAGE:
    return handleChatMessage(state, action);
  default:
    return state;
  }
}

export function sendChatMessage(message) {
  socket.emit('send-chat-message', message);
  // return {
  //   type: SEND_
  // };
}

export function receiveChatMessage(message) {
  return {
    type: RECEIVE_CHAT_MESSAGE,
    payload: message
  };
}

export function setProperty(property, value) { 
  return {
    type: SET_PROPERTY,
    payload: { [property]: value }
  };
}

// actions:
// captain makes nomination
// captain / admin chats
// admin pauses draft
// admin resumes draft
// captain bids
// nomination ends / player goes to team
