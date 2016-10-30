import Sequelize from 'sequelize';
import GS from 'google-sheets-node-api';
import { shuffle, assign } from 'lodash';

import crypto from 'crypto';
const secret = 'unclerix';

const sequelize = new Sequelize('postgres://localhost:5432/drafter');

const Draft = sequelize.define('draft', {
  has_begun: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  is_paused: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  player_is_nominated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  latest_nomination_time: {
    type: Sequelize.DATE,
    allowNull: true
  },
  current_nomination: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  season_number: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false
  },
  private: Sequelize.BOOLEAN
});

const Team = sequelize.define('team', {
  captain: Sequelize.STRING,
  captain_is_npc: Sequelize.BOOLEAN,
  preliminary_pick: Sequelize.STRING,
  division: Sequelize.STRING,
  name: Sequelize.STRING,
  tag_coins: Sequelize.INTEGER,
  keeper_coins: Sequelize.INTEGER
});

const History = sequelize.define('history', {
  action_type: Sequelize.ENUM('nomination', 'bid', 'win', 'edit'),
  payload: Sequelize.JSON,
  timestamp: Sequelize.DATE,
  actor: Sequelize.INTEGER,
  draft: Sequelize.INTEGER
});

const Player = sequelize.define('player', {
  name: Sequelize.STRING,
  current_bid_amount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  current_bid_team: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  keeper_team: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  is_nominated: Sequelize.BOOLEAN,
  is_selected: Sequelize.BOOLEAN
});

const Nomination = sequelize.define('nomination', {
  is_done: Sequelize.BOOLEAN,
  start_time: Sequelize.DATE,
  pick_number: Sequelize.INTEGER,
  my_turn: Sequelize.BOOLEAN,
  roster_full: Sequelize.BOOLEAN
});

const User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  is_admin: Sequelize.BOOLEAN,
  is_captain: Sequelize.BOOLEAN
});

Draft.hasMany(Player);
Draft.hasMany(Team);
Draft.hasMany(Nomination);
User.belongsTo(Team);
Nomination.belongsTo(Player);
Nomination.belongsTo(Team);

export function createTablesInDB() {
  Draft.findAll({ where: { id: 1 }}).catch(() => {
    Draft.sync({ force: true }).then(() => {
      return Team.sync({ force: true });
    }).then(() => {
      return Player.sync({ force: true });
    }).then(() => {
      return Nomination.sync({ force: true });
    }).then(() => {
      return History.sync({ force: true });
    }).then(() => {
      return User.sync({ force: true });
    });
  });
}

export function createDraft(seasonNumber, teams, tagCoins, keeperCoins, signupSheet, legacySheet, numSignups, draftRounds, manualDraftOrder) {
  let draftId;
  return Draft.create({
    season_number: seasonNumber
  }).then((draft) => {
    draftId = draft.id;
    return addTeamsToDraft(teams, seasonNumber, tagCoins, keeperCoins, legacySheet, draftId);
  }).then(() => {
    return importSignups(signupSheet, numSignups, legacySheet, seasonNumber, draftId);
  }).then(() => {
    const randomize = !(!!manualDraftOrder);
    return createNominationOrder(randomize, manualDraftOrder, draftId, draftRounds);
  }).then(() => {
    return draftId;
  });
}

function addTeamsToDraft(teams, seasonNumber, tagCoinsPerTeam, keeperCoinsForLegacy, legacySheet, draftId) {
  const keeperDoc = new GS(legacySheet);

  return keeperDoc.getSpreadsheet()
    .then((info) => {
      return info.worksheets[0].getRows({
        offset: 0,
        limit: 100,
        orderby: 'col1'
      });
    }).then((keepers) => {
      const promises = teams.map((team) => {
        Team.create({
          captain: team.captainName,
          captain_is_npc: team.isNPC,
          preliminary_pick: team.preliminaryPick,
          division: team.division,
          name: team.teamName,
          tag_coins: tagCoinsPerTeam,
          keeper_coins: isLegacyTeam(keepers, team.teamName) ? keeperCoinsForLegacy : 0,
          draftId: draftId
        });
      });
      return Promise.all(promises);
    });
}

function isLegacyTeam(keepers, name) {
  let isLegacy = false;
  keepers.forEach((k) => {
    if ( k.team.toLowerCase() === name.toLowerCase() ) {
      isLegacy = true;
    }
  });
  return isLegacy;
}

function findKeeperTeam(keepers, player, seasonNumber) {
  const playerName = (player.name || player.title || player[`season${seasonNumber}name`]).toLowerCase();
  let teamName;
  keepers.forEach((k) => {
    const name = (k[`S${seasonNumber} Name`] || '').toLowerCase();
    if ( name === playerName ) {
      teamName = k.team;
    }
  });
  return teamName;
}

function importSignups(signupSheetId, numSignups, keeperSheetId, seasonNumber, draftId) {
  const signupDoc = new GS(signupSheetId);
  const keeperDoc = new GS(keeperSheetId);

  let keepers;

  return keeperDoc.getSpreadsheet()
    .then((info) => {
      return info.worksheets[0].getRows({ offset: 1, limit: 5000, orderby: 'col1' });
    }).then((keeperData) => {
      keepers = keeperData;
      return signupDoc.getSpreadsheet();
    }).then((info) => {
      return info.worksheets[0].getRows({ offset: 0, limit: 100, orderby: 'col1' });
    }).then((signups) => {
      const playerPromises = signups.map((player) => {
        let playerTeamId;
        const keeperTeamName = findKeeperTeam(keepers, player, seasonNumber);
        const isEligibleKeeper = !!keeperTeamName;
        let continuation = isEligibleKeeper ? Team.findOne({ where: { name: keeperTeamName }}) : new Promise(resolve => resolve());
        return continuation.then((team) => {
          if ( team ) {
            playerTeamId = team.id;
          }
        }).then(() => {
          return Player.create({
            name: player.name || player.title || player[`season${seasonNumber}name`],
            current_bid_amount: 0,
            current_bid_team: null,
            keeper_team: playerTeamId,
            draftId: draftId
          });
        });
      });
      return Promise.all(playerPromises);
    });
}

function createNominationOrder(randomize, manualOrder, draftId, draftRounds) {
  return Team.findAll({ where: { draftId }}).then((teams) => {
    const order = randomize ? shuffle(teams) : manualOrder;
    let rounds = draftRounds > 0 && draftRounds < 10 ? draftRounds : 1;
    const nominationPromises = [];
    let pickNumberTracker = 0;
    while ( rounds-- ) {
      order.forEach((t, i) => {
        nominationPromises.push(Nomination.create({
          teamId: t.id,
          is_done: false,
          pick_number: i +  1 + pickNumberTracker,
          draftId: draftId
        }));
      });
      pickNumberTracker += teams.length;
    }
    return Promise.all(nominationPromises);
  });
}

export function loadDraft(id) {
  let teams, draft, nominations, players, nominationOrder;
  return Draft.findOne({ where: { id }})
    .then((d) => {
      draft = d;
      return Team.findAll({ where: { draftId: id }});
    }).then((t) => {
      teams = t;
      return Player.findAll({ where: { draftId: id }});
    }).then((p) => {
      players = p;
      return Nomination.findAll({ where: { draftId: id }, order: ['pick_number']});
    }).then((n) => {
      nominations = n;
      nominationOrder = nominations.slice(0,teams.length);
      return { teams, draft, nominations, players, nominationOrder };
    });
}

export function createUser(username, password) {
  const hashedPW = crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');
  return User.create({ username, password: hashedPW });
}

export function loadUser(username, password) {
  const hashedPW = crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');
  return User.findOne({ where: { username }})
    .then((user) => {
      const isValid = user.password === hashedPW;
      return { user: user.toJSON(), isValid };
    });
}

export function teamUpdate(prop, val, id) {
  return Team.findOne({ where: { id }}).then((team) => {
    return team.update({ [prop]: val });
  });
}

export function nominationUpdate(prop, val, pick_number) {
  return Nomination.findOne({ where: { pick_number }}).then((nomination) => {
    return nomination.update({ [prop]: val });
  });
}

export function playerUpdate(prop, val, id) {
  return Player.findOne({ where: { id }}).then((player) => {
    return player.update({ [prop]: val });
  });
}

export function captaincyUpdate(username, giveOrRemove, teamId) {
  const captain = giveOrRemove === 'give' ? true : false;
  return User.findOne({ where: { username }}).then((user) => {
    return user.update({ is_captain: captain, teamId: captain ? teamId : null });
  });
}

export function updateNomination(playerName, teamId, nomId, coins) {
  return sequelize.transaction((t) => {
    return Promise.all([
      Player.findOne({ where: { name: playerName }}, { transaction: t }),
      Nomination.findOne({ where: { id: nomId }}, { transaction: t }),
      Team.findOne({ where: { id: teamId }}, { transaction: t })
    ])
    .then((results) => {
      const [player, nomination, team] = results;

      return Promise.all([
        Draft.findOne({ where: { id: nomination.draftId }}, { transaction: t }),
        player.update(
          { is_nominated: true, current_bid_team: teamId, current_bid_amount: coins },
          { transaction: t }
        ),
        nomination.update({ start_time: new Date(), playerId: player.id }, { transaction: t })
      ])
      .then((results) => {
        const [draft] = results;
        return draft.update(
          { has_begun: true, player_is_nominated: true, latest_nomination_time: new Date(), current_nomination: nomId },
          { transaction: t }
        );
      })
      .then(() => team);
    });
  });
}

export function updateAfterBid(teamId, coins, nomId, player) {
  return Player.findOne({ where: { name: player }}).then((p) => {
    return p.update({ current_bid_team: +teamId, current_bid_amount: coins });
  }).then(() => {
    return Team.findOne({ where: { id: +teamId }});
  });
}

export function teamWinsPlayer(nomId, playerName, nextNominator) {
  let player;
  let draftId;
  let pickNumber;
  let winnerId;
  let winnerRosterIsFull = false;
  let teamName, coins;
  return Player.findOne({ where: { name: playerName }}).then((p) => {
    if ( p.is_selected ) throw new Error('Already updated player.');
    player = p;
    return p.update({ is_selected: true });
  }).then(() => {
    winnerId = +player.current_bid_team;
    return Player.findAll({ where: {
      current_bid_team: winnerId,
      is_selected: true
    }});
  }).then((roster) => {
    winnerRosterIsFull = roster.length === 3;
    return Nomination.findOne({ where: { id: +nomId }});
  }).then((n) => {
    draftId = n.draftId;
    pickNumber = n.pick_number;
    return n.update({ my_turn: false, roster_full: winnerRosterIsFull });
  }).then(() => {
    return Team.findOne({ where: { id: winnerId }});
  }).then((t) => {
    teamName = t.name;
    let keeper_coins = t.keeper_coins;
    let tag_coins = t.tag_coins;
    const isKeeper = +player.keeper_team === +player.current_bid_team;
    let cost = player.current_bid_amount;
    coins = player.current_bid_amount;
    if ( isKeeper ) {
      const canPayFullCost = keeper_coins - cost > 0;
      const couldPay = canPayFullCost ? cost : keeper_coins;
      const willPay = couldPay > 5 ? 5 : couldPay;
      keeper_coins = keeper_coins - willPay;
      cost = cost - willPay;
    }
    tag_coins = tag_coins - cost;
    return t.update({ tag_coins, keeper_coins });
  }).then(() => {
    return Nomination.findOne({ where: { id: +nextNominator }});
  }).then((n2) => {
    return n2.update({ my_turn: true });
  }).then(() => {
    return { coins, teamName, draftId };
  });
}
