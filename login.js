import passport from 'passport';
import passportLocal from 'passport-local';
const { Strategy: LocalStrategy } = passportLocal;

import { validateUser } from './db';

passport.use(new LocalStrategy(
  (username, password, done) => {
    validateUser(username, password)
      .then((isValid) => {
        if ( isValid ) {
          return done(null, { username });
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
