import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.normalize(__dirname + '/dist')));

import { createTablesInDB } from './db';
createTablesInDB();

import socketio from 'socket.io';
const io = socketio.listen(app.listen(process.env.PORT || 3000));
io.on('connection', () => {
  console.log('u wot m8');
});

export const exports = {
  app,
  socket: io.sockets
};

app.get('/api/test', (req, res) => {
  res.json({ top: 'qak' });
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});
