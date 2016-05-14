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
      teamRoster.push({ name: team.captain, isCaptain: true });
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

  renderRosterSpot(player) {
    let className = 'player-cost';
    if ( player.isCaptain ) className = 'player-captain';
    if ( player.isPreliminaryPick ) className = 'player-prelim';
    return (
      <div className="roster-spot">
        <span className="player-name">{player.name}</span>
        <span className={className}>{player.current_bid_amount}</span>
      </div>
    );
  }

  renderTeam(team, i) {
    const east = team.division === 'Northeast' || team.division === 'Atlantic';
    const className=`col-md-3 ${east ? 'east-team' : 'west-team'}`;
    const hasPrelimPick = team.captain_is_npc;
    const roster = team.roster;
    const fullRosterLength = hasPrelimPick ? 5 : 4;
    const rosterLength = roster.length;
    let spacesToFill = fullRosterLength - rosterLength;
    while ( spacesToFill-- ) {
      roster.push({});
    }
    return (
      <div className={className} key={i}>
        <div className="team-title">
          {team.name}
          <br/>
          {team.tag_coins} ({team.keeper_coins})
        </div>
        <div className="roster-spots">
          {roster.map(this.renderRosterSpot)}
        </div>
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
        <div className="row">
          {sortBy(northeast, (t) => t.name).map(this.renderTeam)}
        </div>
        <div className="row">
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
        <div className="row">
          {sortBy(central, (t) => t.name).map(this.renderTeam)}
        </div>
        <div className="row">
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
      <div className="draft-teams">
        {this.renderEast(east)}
        {this.renderWest(west)}
      </div>
    );
  }
}

export default DraftTeams;
