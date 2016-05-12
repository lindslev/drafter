import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.normalize(__dirname + '/dist')));
app.use(cookieParser());
app.use(expressSession({ secret: 'meowmeow' }));

import { createTablesInDB } from './db';
createTablesInDB();

import passport from 'passport';
import './login';
app.use(passport.initialize());
app.use(passport.session());

import socketio from 'socket.io';
const io = socketio.listen(app.listen(process.env.PORT || 3000));
io.on('connection', (socket) => {
  console.log('A user connected.');
  const broadcast = io.sockets;

  broadcast.emit('receive-chat-message', {
    username: 'gem',
    message: 'qak',
    sent: new Date(),
    type: 'message'
  });

  socket.on('send-chat-message', (message) => {
    broadcast.emit('receive-chat-message', message);
  });

});

import { addRoutes } from './routes';
addRoutes(app);

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});
