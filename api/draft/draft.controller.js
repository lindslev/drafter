import { broadcast } from '../../server';
import { createDraft, loadDraft, captaincyUpdate,
         playerUpdate, nominationUpdate, teamUpdate,
         updateNomination, updateAfterBid, teamWinsPlayer } from '../../db';

export function show(req, res) {
  loadDraft(Number(req.query.id || 1))
    .then((draft) => {
      res.status(200).json(draft);
    }).catch((err) => {
      console.log('err', err);
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
    console.log('err', err);
    res.status(400).json(err);
  });
}

export function updateProperty(req, res) {
  const updateFxns = { playerUpdate, teamUpdate, nominationUpdate };
  const { type, prop, val, identifier, draftId } = req.body || {};
  const updateFxn = updateFxns[`${type}Update`];
  updateFxn(prop, val, identifier).then(() => {
    broadcast.emit('admin-update', { draftId });
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

let lastBid = 0;

export function bidOnPlayer(req, res) {
  const { bidderId, coins, nomId, player } = req.body || {};
  if ( +coins > lastBid  ) {
    lastBid = +coins;
    updateAfterBid(bidderId, coins, nomId, player).then((team) => {
      broadcast.emit('bid', { bidderId, coins, playerName: player, teamName: team.name });
      res.status(200).json({});
    }).catch((err) => {
      console.log('err', err);
      res.status(400).json(err);
    });
  } else {
    res.status(400).json({ too: 'low' });
  }
}

export function playerWon(req, res) {
  const { nomId, playerName, nextNomId } = req.body || {};
  teamWinsPlayer(nomId, playerName, nextNomId).then((data) => {
    lastBid = 0;
    const { teamName, coins, draftId } = data;
    broadcast.emit('win', { playerName, teamName, coins, draftId });
    res.status(200).json({});
  }).catch((err) => {
    console.log('err', err);
    res.status(400).json(err);
  });
}

export function setStatusOfDraft(req, res) {
  const { status } = req.body || {};
  console.log('statusset');
  res.status(200).json({});
}
