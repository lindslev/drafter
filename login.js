import passport from 'passport';
import passportLocal from 'passport-local';
const { Strategy: LocalStrategy } = passportLocal;

import { loadUser } from './db';

passport.use(new LocalStrategy(
  (username, password, done) => {
    loadUser(username, password)
      .then((u) => {
        const { isValid, user } = u;
        if ( isValid ) {
          return done(null, { user });
        } else {
          return done(null, false, { message: 'Username or password is incorrect.' });
        }
      }).catch((err) => {
        return done(null, false, { message: 'Username or password is incorrect.' });
      });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
