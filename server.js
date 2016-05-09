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
  console.log('A user connected.');
});

import { addRoutes } from './routes';
addRoutes(app);

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});
