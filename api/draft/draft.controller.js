import { broadcast } from '../../server';
import { createDraft, loadDraft, captaincyUpdate,
         playerUpdate, nominationUpdate, teamUpdate,
         updateNomination, updateAfterBid } from '../../db';

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

export function setNomination(req, res) {
  const { playerName, teamId, nomId, coins } = req.body || {};
  updateNomination(playerName, teamId, nomId, coins).then((team) => {
    broadcast.emit('nomination', { playerName, teamId, nomId, coins, teamName: team.name });
    res.status(200).json({});
  }).catch((err) => {
    console.log('err', err);
    res.status(400).json(err);
  });
}

export function bidOnPlayer(req, res) {
  const { bidderId, coins, nomId, player } = req.body || {};
  updateAfterBid(bidderId, coins, nomId, player).then((team) => { 
    broadcast.emit('bid', { bidderId, coins, playerName: player, teamName: team.name });
    res.status(200).json({});
  }).catch((err) => {
    console.log('err', err);
  });
}

export function playerWon(req, res) {
  // Nomination.update
  // Player.update
  // Team.update -> coins (need to do math for TC or KEEPER)
  const { winnerId } = req.body || {};
  broadcast.emit('win', { winnerId });
  res.status(200).json({});
}

export function setStatusOfDraft(req, res) {
  // Draft.update
  // If current nomination in flight, Nomination.update
  const { status } = req.body || {};
  console.log('statusset');
  res.status(200).json({});
}
