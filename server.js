import express from 'express';

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

import { createTablesInDB } from './db';
createTablesInDB();

app.listen(3000);
