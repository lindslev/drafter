import { assign, identity, findIndex } from 'lodash';
import { handlePromiseAction } from '../utils';

const RECEIVE_CHAT_MESSAGE = 'CHAT_MESSAGE';
const SET_PROPERTY = 'SET_PROPERTY';
const NOMINATE_PLAYER = 'NOMINATE_PLAYER';
const PLAYER_NOMINATED = 'PLAYER_NOMINATED';
const BID = 'BID';
const BID_MADE = 'BID_MADE';
const WIN_PLAYER = 'WIN_PLAYER';
const PLAYER_WON = 'PLAYER_WON';

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

function handleBidMade(state, { payload }) {
  const { bidderId, coins } = payload;
  return assign({}, state, { lastBid: { teamId: bidderId, coins } });
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
    time: 0,
    lastBid: {}
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
  case BID_MADE:
    return handleBidMade(state, action);
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

export function bidOnNomination(bidderId, coins, nomId, nominatedPlayer) {
  return {
    type: BID,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.bidOnPlayer(bidderId, coins, nomId, nominatedPlayer);
      }
    }
  };
}

export function bidMadeOnNomination(bid) {
  return {
    type: BID_MADE,
    payload: bid
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

function rotateArray(array, times) {
  array = array.slice();
  while(times--){
    var temp = array.shift();
    array.push(temp)
  }
  return array;
}

function getNext(nominations, pickNumber) {
  let idx;
  let nomination;
  let originalNomination;
  let tempNoms = nominations;
  for (idx=0; idx<nominations.length; idx++) {
    nomination = nominations[idx];
    if (nomination.pick_number === pickNumber) {
      break;
    }
  }

  tempNoms = rotateArray(tempNoms, idx);
  originalNomination = tempNoms.shift();

  let broke = false;

  for (idx=0; idx<tempNoms.length; idx++) {
    nomination = tempNoms[idx];
    if (!nomination.roster_full) {
      broke = true;
      break;
    }
  }
  if (!broke) {
    if (originalNomination.roster_full) {
      nomination = undefined;
    } else {
      nomination = originalNomination;
    }
  }
  return nomination;
}

export function stopTimer() {
  return (dispatch, getState) => {
    const { runDraft, editDraft } = getState();
    const { timerId, nominatedPlayer, lastBid } = runDraft;
    const { nominationOrder } = editDraft;
    const currentNom = nominationOrder[findIndex(nominationOrder, (n) => n.my_turn)] || {};
    const nextNominator = getNext(nominationOrder, currentNom.pick_number) || {};
    if (timerId !== null) {
      clearInterval(timerId);
      dispatch({ type: TIMER_STOPPED, payload: timerId });
      dispatch(winPlayer(currentNom.id, nominatedPlayer, nextNominator.id));
    }
  }
}

// potentially add handler that'll reset the state of lastBid here
export function winPlayer(nomId, playerName, nextNomId) {
  return {
    type: WIN_PLAYER,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.playerWon(nomId, playerName, nextNomId);
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
