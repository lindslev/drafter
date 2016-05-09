import draft from './api/draft/draft.route';

const routes = [
  draft
];

export function addRoutes(app) {
  routes.forEach((r) => r(app));
}
