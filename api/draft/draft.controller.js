import { createDraft, loadDraft } from '../../db';

export function show(req, res) {
  loadDraft(Number(req.query.id || 1))
    .then((draft) => {
      console.log('draft', draft);
      res.status(200).json(draft);
    }).catch((err) => {
      res.status(400).json(err);
    });
}

export function create(req, res) {
  const data = req.body || {};
  const { seasonNumber, teams, tagCoins,
          keeperCoins, signupSheet, legacySheet,
          numSignups, draftRounds, manualDraftOrder } = data;
  createDraft(seasonNumber, teams, tagCoins, keeperCoins, signupSheet, legacySheet, numSignups, draftRounds, manualDraftOrder).then((draftId) => {
    res.status(200).json({ draftId });
  }).catch((err) => {
    res.status(400).json(err);
  });
}
