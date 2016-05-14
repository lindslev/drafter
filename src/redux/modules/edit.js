import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

export const LOAD_DRAFT = 'LOAD_DRAFT';
const SET_PROPERTY = 'SET_PROPERTY';
const EDIT_CAPTAINCY = 'EDIT_CAPTAINCY';
const UPDATE_PROPERTY = 'UPDATE_PROPERTY';

function handleSetProperty(state, action) {
  return assign({}, state, action.payload);
}

const handleLoadDraft = handlePromiseAction(
  identity,
  (state, { payload }) => {
    return assign({}, state, payload);
  }
);

const initialState = {
  teams: [],
  nominations: [],
  players: [],
  history: null,
  usernameForCaptaincyEdit: null,
  giveOrRemoveCaptaincy: null,
  teamNameToGiveCaptaincy: null,
  typeToEdit: null,
  propToEdit: null,
  newValueForEdit: null,
  identifierForEdit: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case SET_PROPERTY:
    return handleSetProperty(state, action);
  case LOAD_DRAFT:
    return handleLoadDraft(state, action);
  default:
    return state;
  }
}

export function loadDraft(id) {
  return {
    type: LOAD_DRAFT,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.loadDraft(id);
      }
    }
  };
}

export function setProperty(property, value) {
  return {
    type: SET_PROPERTY,
    payload: { [property]: value }
  };
}

export function updateProperty(type, prop, val, identifier, draftId) {
  return {
    type: UPDATE_PROPERTY,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.updateProperty(type, prop, val, identifier, draftId);
      }
    }
  };
}

export function editCaptaincy(username, giveOrRemove, teamId) {
  return {
    type: EDIT_CAPTAINCY,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.editCaptaincy(username, giveOrRemove, teamId);
      }
    }
  };
}
