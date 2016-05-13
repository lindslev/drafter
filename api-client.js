import superagent from 'superagent';
import { camelizeKeys, decamelizeKeys } from 'humps';

function createHTTPRequest(method) {
  return (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const request = superagent[method](path);
      if ( options.form ) {
        request.type('form');
      }

      if ( options.params ) {
        request.query(options.params);
      }

      if ( options.data ) {
        request.send(options.data);
      }

      request.end((err, res) => {
        if ( err ) {
          reject({ err, res });
        } else {
          resolve(res.body ? res.body : res.text);
        }
      });
    });
  };
}

const get = createHTTPRequest('get');
const post = createHTTPRequest('post');
const put = createHTTPRequest('put');
const del = createHTTPRequest('del');

function camelizeResponse(request) {
  return request.then(camelizeKeys);
}

function parseError(request) {
  return request
    .catch(({ res }) => Promise.reject(camelizeKeys(JSON.parse(res.text))));
}

export function createDraft(draft) {
  return post(`/api/draft`, {
    data: draft
  });
}

export function loadDraft(id) {
  return get(`/api/draft`, {
    params: { id }
  });
}

export function loginUser(username, password) {
  return post(`/api/login`, {
    data: { username, password }
  });
}

export function createUser(username, password) {
  return post(`/api/login/create`, {
    data: { username, password }
  });
}

export function updateProperty(type, prop, val, identifier) {
  return post(`/api/draft/update`, {
    data: { type, prop, val, identifier }
  });
}

export function editCaptaincy(username, giveOrRemove, teamId) {
  return post(`/api/draft/captaincy`, {
    data: { username, giveOrRemove, teamId }
  });
}

export function nominatePlayer(playerName, teamId, nomId, coins) {
  return post(`/api/draft/nomination`, {
    data: { playerName, teamId, nomId, coins }
  });
}

export function bidOnPlayer(bidderId, coins, nomId) {
  return post(`/api/draft/bid`, {
    data: { bidderId, coins, nomId }
  });
}

export function playerWon(winnerId) {
  return post(`/api/draft/win`, {
    data: { winnerId }
  });
}

export function setStatusOfDraft(status) {
  // only admins
  return post(`/api/draft/status`, {
    data: { status }
  });
}
