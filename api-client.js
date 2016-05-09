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

export function getTest() {
  return camelizeResponse(parseError(get(`api/test`)));
}