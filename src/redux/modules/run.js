import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

const RECEIVE_CHAT_MESSAGE = 'CHAT_MESSAGE';
const SET_PROPERTY = 'SET_PROPERTY';
const NOMINATE_PLAYER = 'NOMINATE_PLAYER';
const PLAYER_NOMINATED = 'PLAYER_NOMINATED';
const BID = 'BID';

function handleChatMessage(state, { payload }) {
  const newStream = state.stream;
  newStream.unshift(payload);
  return assign({}, state, { stream: newStream });
}

function handleSetProperty(state, action) {
  return assign({}, state, action.payload);
}

function handlePlayerNominated(state, { payload }) {
  const { playerName, teamId, coins } = payload;
  document.getElementById('go').play();
  return assign({}, state, { nominatedPlayer: playerName, lastBid: {
    teamId, coins
  }});
}

const initialState = {
  stream: [],
  userChatMessage: '',
  captainBid: 0,
  captainNomination: '',
  nominatedPlayer: '',
  lastBid: {},
  timerRunning: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case SET_PROPERTY:
    return handleSetProperty(state, action);
  case RECEIVE_CHAT_MESSAGE:
    return handleChatMessage(state, action);
  case PLAYER_NOMINATED:
    return handlePlayerNominated(state, action);
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

export function nominatePlayer(playerName, teamId, nomId, coins) {
  return {
    type: NOMINATE_PLAYER,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.nominatePlayer(playerName, teamId, nomId, coins);
      }
    }
  };
}

export function playerNominated(nomination) {
  return {
    type: PLAYER_NOMINATED,
    payload: nomination
  };
}

export function bidOnNomination(bidderId, coins, nomId) {
  return {
    type: BID,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.bidOnPlayer(bidderId, coins, nomId);
      }
    }
  };
}

// to do:
// captain makes nomination
// captain bids
// nomination ends / player goes to team
// admin pauses / resumes draft
//
// done:
// captain / admin chats
