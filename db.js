import Sequelize from 'sequelize';
import GS from 'google-sheets-node-api';
import { shuffle } from 'lodash';

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
  team: Sequelize.INTEGER,
  is_done: Sequelize.BOOLEAN,
  start_time: Sequelize.DATE,
  player: Sequelize.INTEGER,
  pick_number: Sequelize.INTEGER
});

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  is_admin: Sequelize.BOOLEAN,
  is_captain: Sequelize.BOOLEAN
});

Draft.hasMany(Player);
Draft.hasMany(Team);
Draft.hasMany(Nomination);
// Player.belongsToMany
// Team.hasMany(Player, { foreignKey: 'current_bid_team' });

export function createTablesInDB() {
  Draft.findAll({ where: { id: 1 }}).catch(() => {
    Draft.sync({ force: true }).then(() => {
      return Team.sync({ force: true });
    }).then(() => {
      return Player.sync({ force: true });
    }).then(() => {
      return Nomination.sync({ force: true });
    });
    History.sync({ force: true });
    User.sync({ force: true });
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
    return importSignups(signupSheet, numSignups, legacySheet, seasonNumber);
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
      // might want captain name to be a player id instead of a string
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
    if ( k[`s${seasonNumber}name`].toLowerCase() === playerName ) {
      teamName = k.team;
    }
  });
  return teamName;
}

function importSignups(signupSheetId, numSignups, keeperSheetId, seasonNumber) {
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
            keeper_team: playerTeamId
          });
        });
      });
      return Promise.all(playerPromises);
    });
}

function createNominationOrder(randomize, manualOrder, draftId, draftRounds) {
  return Team.findAll({ where: { draftId }}).then((teams) => {
    const nominationOrder = randomize ? shuffle(teams) : manualOrder;
    let rounds = draftRounds > 0 && draftRounds < 10 ? draftRounds : 1;
    const nominationPromises = [];
    let pickNumberTracker = 0;
    while ( rounds-- ) {
      nominationOrder.forEach((t, i) => {
        nominationPromises.push(Nomination.create({
          team: t.id,
          is_done: false,
          player: null,
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
  let teams, draft, nominations, players;
  return Draft.findOne({ where: { id }})
    .then((d) => {
      draft = d;
      return Team.findAll({ where: { draftId: id }});
    }).then((t) => {
      teams = t;
      return Player.findAll({ where: { draftId: id }});
    }).then((p) => {
      players = p;
      return Nomination.findAll({ where: { draftId: id }});
    }).then((n) => {
      nominations = n;
      return { teams, draft, nominations, players };
    });
}

export function createUser(username, password) {
  const hashedPW = crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');
  return User.create({ username, password: hashedPW });
}

export function validateUser(username, password) {
  const hashedPW = crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');
  return User.findOne({ where: { username }})
    .then((user) => {
      return user.password === hashedPW;
    });
}
