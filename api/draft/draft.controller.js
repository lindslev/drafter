import { createDraft, loadDraft, captaincyUpdate,
         playerUpdate, nominationUpdate, teamUpdate } from '../../db';

export function show(req, res) {
  loadDraft(Number(req.query.id || 1))
    .then((draft) => {
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

export function updateProperty(req, res) {
  const updateFxns = { playerUpdate, teamUpdate, nominationUpdate };
  const { type, prop, val, identifier } = req.body || {};
  const updateFxn = updateFxns[`${type}Update`];
  updateFxn(prop, val, identifier).then(() => {
    res.status(200).json({});
  }).catch((err) => {
    res.status(400).json(err);
  });
}

export function editCaptaincy(req, res) {
  const { username, giveOrRemove, teamId } = req.body || {};
  captaincyUpdate(username, giveOrRemove, teamId).then(() => {
    res.status(200).json({});
  }).catch((err) => {
    res.status(400).json(err);
  });
}
