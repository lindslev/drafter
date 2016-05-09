import { assign, identity } from 'lodash';
import { handlePromiseAction } from '../utils';

export const LOAD_TEAMS = 'LOAD_TEAMS';

const handleLoadTeams = handlePromiseAction(
  identity,
  (state, { payload }) => {
    return assign({}, state, { teams: payload });
  }
);

const initialState = {
  teams: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case LOAD_TEAMS:
    return handleLoadTeams(state, action);
  default:
    return state;
  }
}

export function loadTeams(seasonNumber) {
  return {
    type: LOAD_TEAMS,
    payload: {
      futureAPIPayload(apiClient) {
        return apiClient.getTest();
      }
    }
  };
}

