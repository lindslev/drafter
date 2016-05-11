import { show, create, updateProperty, editCaptaincy } from './draft.controller';
const routePrefix = '/api/draft';

export default function draftRoutes(app) {
  app.get(routePrefix + '/', show);
  app.post(routePrefix + '/', create);
  app.post(routePrefix + '/update', updateProperty);
  app.post(routePrefix + '/captaincy', editCaptaincy);
}
