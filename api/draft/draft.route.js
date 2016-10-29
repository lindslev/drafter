import { show, create, updateProperty, editCaptaincy,
         setNomination, bidOnPlayer, playerWon,
         setStatusOfDraft } from './draft.controller';
const routePrefix = '/api/draft';

export default function draftRoutes(app) {
  app.get(routePrefix + '/', show);
  app.post(routePrefix + '/', create);
  app.post(routePrefix + '/update', updateProperty);
  app.post(routePrefix + '/captaincy', editCaptaincy);
  app.post(routePrefix + '/nomination', setNomination);
  app.post(routePrefix + '/bid', bidOnPlayer);
  app.post(routePrefix + '/win', playerWon);
  app.post(routePrefix + '/status', setStatusOfDraft);
}
