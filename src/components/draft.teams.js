import React from 'react';
import { assign, filter, remove, sortBy } from 'lodash';

class DraftTeams extends React.Component {
  constructor(props) {
    super(props);
    this.renderEast = this.renderEast.bind(this);
    this.renderWest = this.renderWest.bind(this);
    this.renderTeam = this.renderTeam.bind(this);
  }

  buildRosters(teams, players) {
    const selectedPlayers = sortBy(filter(players, (p) => {
      return p.is_selected;
    }), (p) => p.updatedAt);
    const teamsWithRosters = teams.map((team) => {
      const teamRoster = [];
      const teamHasPrelimPick = team.preliminary_pick.length > 0;
      teamRoster.push({ name: team.captain, isCaptain: true, isNPC: teamHasPrelimPick });
      if ( teamHasPrelimPick ) {
        teamRoster.push({ name: team.preliminary_pick, isPreliminaryPick: true });
      }
      selectedPlayers.forEach((p) => {
        if ( +p.current_bid_team === +team.id ) {
          teamRoster.push(p);
        }
      });
      const teamObj = assign({}, team, { roster: teamRoster });
      return teamObj;
    });
    return teamsWithRosters;
  }

  renderRosterSpot(player, i) {
    let playerClass = 'team-row';
    if ( player.isNPC ) playerClass += ' player-npc';
    if ( player.isCaptain ) playerClass += ' player-captain';
    if ( player.isPreliminaryPick ) playerClass += ' player-npc-pick';
    return (
      <div className={playerClass} key={i}>
        <div className="player-name">{player.name}</div>
        <div className="player-price">
          { player.isCaptain || player.isPreliminaryPick ?
            <i className="material-icons">star</i>
            :
            player.current_bid_amount
          }
        </div>
      </div>
    );
  }

  renderTeam(team, i) {
    const east = team.division === 'Northeast' || team.division === 'Atlantic';
    const className=`card ${east ? 'team-east' : 'team-west'}`;
    const hasPrelimPick = team.captain_is_npc;
    const roster = team.roster;
    const fullRosterLength = hasPrelimPick ? 6 : 5;
    const rosterLength = roster.length;
    let spacesToFill = fullRosterLength - rosterLength;
    while ( spacesToFill-- ) {
      roster.push({});
    }
    return (
      <div className={className} key={i}>
        <div className="team-header">
          <div className="team-name">{team.name}</div>
          <div className="team-money">
            <div className="coins">{team.tag_coins}</div>
            <div className="separator"> · </div>
            <div className="keepers">{team.keeper_coins}</div>
          </div>
        </div>
        {roster.map(this.renderRosterSpot)}
      </div>
    );
  }

  renderEast(teams) {
    let atlantic = teams;
    const northeast = remove(atlantic, (t) => {
      return t.division === 'Northeast';
    });
    return (
      <div>
        <div className="draft-row">
          {sortBy(northeast, (t) => t.name).map(this.renderTeam)}
        </div>
        <div className="draft-row">
          {sortBy(atlantic, (t) => t.name).map(this.renderTeam)}
        </div>
      </div>
    );
  }

  renderWest(teams) {
    let pacific = teams;
    const central = remove(pacific, (t) => {
      return t.division === 'Central';
    });
    return (
      <div>
        <div className="draft-row">
          {sortBy(central, (t) => t.name).map(this.renderTeam)}
        </div>
        <div className="draft-row">
          {sortBy(pacific, (t) => t.name).map(this.renderTeam)}
        </div>
      </div>
    );
  }

  render() {
    const { teams, players } = this.props;
    const rosterTeams = this.buildRosters(teams, players);
    let west = rosterTeams;
    const east = remove(west, (t) => {
      return t.division === 'Northeast' || t.division === 'Atlantic';
    });
    return (
      <article className="main">
        {this.renderEast(east)}
        {this.renderWest(west)}
      </article>
    );
  }
}

export default DraftTeams;
