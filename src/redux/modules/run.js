import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

const RECEIVE_CHAT_MESSAGE = 'CHAT_MESSAGE';
const SET_PROPERTY = 'SET_PROPERTY';
const NOMINATE_PLAYER = 'NOMINATE_PLAYER';
const PLAYER_NOMINATED = 'PLAYER_NOMINATED';
const BID = 'BID';

const TIMER_TICK = 'TIMER_TICK';
const TIMER_STARTED = 'TIMER_STARTED';
const TIMER_STOPPED = 'TIMER_STOPPED';

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

function handleTimerTick(state, { payload }) {
  return assign({}, state, { time: state.time - 1 });
}

function handleTimerStart(state, { payload }) {
  return assign({}, state, {
    timerId: payload.timerId,
    timerRunning: true,
    time: payload.time
  });
}

function handleTimerStop(state, { payload }) {
  return assign({}, state, {
    timerId: null,
    timerRunning: false,
    time: 0
  });
}

const initialState = {
  stream: [],
  userChatMessage: '',
  captainBid: 0,
  captainNomination: '',
  nominatedPlayer: '',
  lastBid: {},
  timerRunning: false,
  timerId: null,
  time: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case SET_PROPERTY:
    return handleSetProperty(state, action);
  case RECEIVE_CHAT_MESSAGE:
    return handleChatMessage(state, action);
  case PLAYER_NOMINATED:
    return handlePlayerNominated(state, action);
  case TIMER_TICK:
    return handleTimerTick(state, action);
  case TIMER_STARTED:
    return handleTimerStart(state, action);
  case TIMER_STOPPED:
    return handleTimerStop(state, action);
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

function timerTick(dispatch, getState) {
  const { runDraft: { time } } = getState();
  if (time === 0) {
    dispatch(stopTimer());
  } else {
    dispatch({ type: TIMER_TICK });
  }
}

export function startTimer(type) {
  return (dispatch, getState) => {
    const { runDraft: { timerId } } = getState();
    const time = type === 'nomination' ? 30 : 15;
    if (timerId === null) {
      dispatch({
        type: TIMER_STARTED,
        payload: {
          timerId: setInterval(timerTick.bind(this, dispatch, getState), 1000),
          time
        }
      });
    } else {
      dispatch({
        type: TIMER_STARTED,
        payload: { timerId, time }
      });
    }
  }
}

export function stopTimer() {
  return (dispatch, getState) => {
    const { runDraft: { timerId } } = getState();
    if (timerId !== null) {
      clearInterval(timerId);
      dispatch({ type: TIMER_STOPPED, payload: timerId });
    }
  }
}

// to do:
// captain makes nomination
// captain bids
// nomination ends / player goes to team
// admin pauses / resumes draft
//
// done:
// captain / admin chats
