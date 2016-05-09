import { createDraft } from '../../db';

export function show(req, res) {
  res.json(200);
}

export function create(req, res) {
  const data = req.body || {};
  const { seasonNumber, teams, tagCoins,
          keeperCoins, signupSheet, legacySheet,
          numSignups, draftRounds, manualDraftOrder } = data;
  createDraft(seasonNumber, teams, tagCoins, keeperCoins, signupSheet, legacySheet, numSignups, draftRounds, manualDraftOrder).then(() => {
    res.json(200);
  }).catch((err) => {
    res.json(err);
  });
}
