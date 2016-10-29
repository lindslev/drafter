import passport from 'passport';
import { create, login } from './login.controller';
const routePrefix = '/api/login';

export default function loginRoutes(app) {
  app.post(routePrefix + '/create', create);
  app.post(routePrefix + '/', passport.authenticate('local'), login);
}
