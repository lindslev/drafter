import Sequelize from 'sequelize';
import GS from 'google-sheets-node-api';

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
    type: Sequelize.UUID,
    allowNull: true
  },
  season_number: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false
  }
});

const Team = sequelize.define('team', {
  captain: Sequelize.STRING,
  name: Sequelize.STRING,
  tag_coins: Sequelize.INTEGER,
  keeper_coins: Sequelize.INTEGER
});

const History = sequelize.define('history', {
  action_type: Sequelize.ENUM('nomination', 'bid', 'win', 'edit'),
  payload: Sequelize.JSON,
  timestamp: Sequelize.DATE,
  actor: Sequelize.UUID,
  draft: Sequelize.UUID
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
  team: Sequelize.UUID,
  is_done: Sequelize.BOOLEAN,
  start_time: Sequelize.DATE,
  player: Sequelize.UUID,
  pick_number: Sequelize.INTEGER
});

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  is_admin: Sequelize.BOOLEAN
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
    });
    History.sync({ force: true });
    Nomination.sync({ force: true });
  });
  // importSignups();
  createDraft(10);
}

const teamArray = [ { teamName: 'qak15', captainName: 'name15' },
  { teamName: 'qak14', captainName: 'name14' },
  { teamName: 'qak13', captainName: 'name13' },
  { teamName: 'qak12', captainName: 'name12' },
  { teamName: 'qak11', captainName: 'name11' },
  { teamName: 'qak10', captainName: 'name10' },
  { teamName: 'qak9', captainName: 'name9' },
  { teamName: 'qak8', captainName: 'name8' },
  { teamName: 'qak7', captainName: 'name7' },
  { teamName: 'qak6', captainName: 'name6' },
  { teamName: 'qak5', captainName: 'name5' },
  { teamName: 'qak4', captainName: 'name4' },
  { teamName: 'qak3', captainName: 'name3' },
  { teamName: 'qak2', captainName: 'name2' },
  { teamName: 'qak1', captainName: 'name1' },
  { teamName: 'Base Gods', captainName: 'name0' } ];

function createDraft(seasonNumber) {
  Draft.create({
    season_number: seasonNumber
  }).then((draft) => {
    return addTeamsToDraft(teamArray, seasonNumber, 100, 10, draft.id);
  }).then(() => {
    return importSignups('id', 1000, 'otherid', seasonNumber);
  }).catch((err) => {
    console.error(err);
  });
}

function addTeamsToDraft(teams, seasonNumber, tagCoinsPerTeam, keeperCoinsForLegacy, draftId) {
  const keepers = '1JX2f6lwMTXwwhegqR16fygh5ipbmsTDbwQWngsBAgwQ';
  const keeperDoc = new GS(keepers);

  return keeperDoc.getSpreadsheet()
    .then((info) => {
      return info.worksheets[0].getRows({
        offset: 0,
        limit: 100,
        orderby: 'col1'
      });
    }).then((keepers) => {
      const promises = teamArray.map((team) => {
        Team.create({
          captain: team.captainName,
          name: team.teamName,
          tag_coins: tagCoinsPerTeam,
          keeper_coins: isLegacyTeam(keepers, team.teamName) ? keeperCoinsForLegacy : 0,
          draft: draftId
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
  const signups = '1tXHrJnO8vebqN8AY6sGoJt19VUSB36Tao8hK4QOfOS0';
  const keeperId = '1JX2f6lwMTXwwhegqR16fygh5ipbmsTDbwQWngsBAgwQ';
  const signupDoc = new GS(signups);
  const keeperDoc = new GS(keeperId);

  let keepers;

  keeperDoc.getSpreadsheet()
    .then((info) => {
      return info.worksheets[0].getRows({ offset: 1, limit: 5000, orderby: 'col1' });
    }).then((keeperData) => {
      keepers = keeperData;
      return signupDoc.getSpreadsheet();
    }).then((info) => {
      return info.worksheets[0].getRows({ offset: 0, limit: 100, orderby: 'col1' });
    }).then((signups) => {
      const promises = signups.map((player) => {
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
    }).catch((err) => {
      console.error(err);
    });
}
