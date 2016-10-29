import draft from './api/draft/draft.route';
import login from './api/login/login.route';

const routes = [
  draft,
  login
];

export function addRoutes(app) {
  routes.forEach((r) => r(app));
}
