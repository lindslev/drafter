import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

export const LOAD_DRAFT = 'LOAD_DRAFT';

const handleLoadDraft = handlePromiseAction(
  identity,
  (state, { payload }) => {
    return assign({}, state, payload);
  }
);

const initialState = {
  teams: null,
  nominations: null,
  players: null,
  history: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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
