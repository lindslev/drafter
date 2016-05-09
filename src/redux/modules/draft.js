import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

export const CREATE_DRAFT = 'CREATE_DRAFT';
export const SET_PROPERTY = 'SET_PROPERTY';

function handleSetDraftProperty(state, action) {
  return assign({}, state, action.payload);
}

const initialState = {
  teams: [],
  manualDraftOrder: null,
  draftRounds: null,
  seasonNumber: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  default:
    return state;
  }
}

export function createDraft(draft) {
  return {
    type: CREATE_DRAFT,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.createDraft(draft);
      }
    }
  };
}

export function setDraftProperty(property, value) {
  return {
    type: SET_PROPERTY,
    payload: { [property]: value }
  };
}
