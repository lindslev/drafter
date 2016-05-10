import { createUser } from '../../db';

export function create(req, res) {
  const { username, password } = req.body || {};
  createUser(username, password).then(() => {
    res.status(200).json({ message: 'ok' });
  }).catch((err) => {
    res.status(400).json(err);
  });
}

export function login(req, res) {
  res.json({ message: 'ok' });
}
