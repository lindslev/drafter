import { show, create } from './draft.controller';
const routePrefix = '/api/draft';

export default function draftRoutes(app) {
  app.get(routePrefix + '/', show);
  app.post(routePrefix + '/', create);
}
