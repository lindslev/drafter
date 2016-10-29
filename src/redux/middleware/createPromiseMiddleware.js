import { assign, omit } from 'lodash';
import * as apiClient from '../../../api-client';

export default function promiseMiddleware({ dispatch, getState }) {
  return (next) => (action) => {
    const { payload, type, meta } = action;

    if ( !payload || !payload.futureAPIPayload ) {
      return next(action);
    }

    const { futureAPIPayload } = payload;
    const restPayload = omit(payload, 'futureAPIPayload');

    next({
      type,
      payload: restPayload,
      meta: assign({}, meta, { loading: true })
    });

    return futureAPIPayload(apiClient, dispatch, getState)
    .then((result) => {
      dispatch({
        type,
        payload: result,
        meta: assign({}, meta, {
          previousPayload: restPayload
        })
      });

      return result;
    })
    .catch((error) => {
      dispatch({
        type,
        payload: error,
        meta: assign({}, meta, {
          previousPayload: restPayload,
          error: true
        })
      });

      return Promise.reject(error);
    });
  };
}
