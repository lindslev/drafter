import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/edit';

class AdminEditView extends React.Component {
  constructor(props) {
    super(props);
    this.editData = this.editData.bind(this);
    this.editPrivs = this.editPrivs.bind(this);
    this.getTeam = this.getTeam.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.renderTeams = this.renderTeams.bind(this);
    this.renderPlayers = this.renderPlayers.bind(this);
    this.renderPlayer = this.renderPlayer.bind(this);
    this.renderNominations = this.renderNominations.bind(this);
    this.renderNomination = this.renderNomination.bind(this);
    this.renderPrivsEditor = this.renderPrivsEditor.bind(this);
    this.renderDataEditor = this.renderDataEditor.bind(this);
    }

    componentWillMount() {
      this.props.draftActions.loadDraft(this.props.routeParams.id);
    }

  editData() {
    const { usernameForCaptaincyEdit, giveOrRemoveCaptaincy,
            teamNameToGiveCaptaincy, typeToEdit, propToEdit,
            newValueForEdit, identifierForEdit } = this.props.draftState;
    const { updateProperty, loadDraft } = this.props.draftActions;
    let identifier;
    if ( typeToEdit === 'team' ) {
      identifier = (this.getTeam(identifierForEdit) || {}).id;
    } else if ( typeToEdit === 'player' ) {
      identifier = (this.getPlayer(identifierForEdit) || {}).id;
    } else {
      identifier = identifierForEdit;
    }
    const draftId = this.props.routeParams.id;
    updateProperty(typeToEdit, propToEdit, newValueForEdit, identifier, draftId).then(() => {
      window.alert(`Updated type ${typeToEdit}, prop ${propToEdit} as ${newValueForEdit}`);
      return loadDraft(this.props.routeParams.id);
    }).catch((err) => {
      window.alert('Error updating property.');
    });
  }

  editPrivs() {
    const { usernameForCaptaincyEdit, giveOrRemoveCaptaincy,
            teamNameToGiveCaptaincy, typeToEdit, propToEdit,
            newValueForEdit, identifierForEdit } = this.props.draftState;
    const { editCaptaincy } = this.props.draftActions;
    const teamId = (this.getTeam(teamNameToGiveCaptaincy) || {}).id;
    editCaptaincy(usernameForCaptaincyEdit, giveOrRemoveCaptaincy, teamId).then(() => {
      window.alert(`Updated captaincy status for ${usernameForCaptaincyEdit}`);
    }).catch((err) => {
      window.alert('Error updating captaincy status.');
    });
  }

  getTeam(idOrName) {
    const { teams } = this.props.draftState;
    let team;
    (teams || []).forEach((t) => {
      if ( +idOrName === +t.id || idOrName === t.name ) {
        team = t;
      }
    });
    return team;
  }

  getPlayer(idOrName) {
    const { players } = this.props.draftState;
    let player;
    (players || []).forEach((p) => {
      if ( +idOrName === +p.id || idOrName === p.name ) {
        player = p;
      }
    });
    return player;
  }

  handleValueChange(key, { target }) {
    const { setProperty } = this.props.draftActions;
    setProperty(key, target.value);
  }

  renderTeam(team) {
    return (
      <div className="admin-team-view">
        <p>Name: {team.name}</p>
        <p>ID: {team.id}</p>
        <p>Captain: {team.captain}</p>
        <p>NPC: {team.captain_is_npc.toString()}</p>
        <p>P.P.: {team.preliminary_pick}</p>
        <p>Keeper coins: {team.keeper_coins}</p>
        <p>Tag coins: {team.tag_coins}</p>
        <p>Division: {team.division}</p>
      </div>
    );
  }

  renderTeams(teams) {
    return (
      <div className="col-md-4">
        <h5>TEAMS</h5>
        {(teams || []).map(this.renderTeam)}
      </div>
    );
  }

  renderPlayer(player) {
    const { is_selected, is_nominated, current_bid_team, keeper_team } = player;
    const lastBid = (this.getTeam(current_bid_team) || {}).name;
    const keeperTeam = (this.getTeam(keeper_team) || {}).name;
    return (
      <div className="admin-player-view">
        <p>Name: {player.name}</p>
        <p>Has been selected: {is_selected ? is_selected.toString() : null}</p>
        <p>Has been nominated: {is_nominated ? is_nominated.toString() : null}</p>
        <p>Last bid by: {lastBid}</p>
        <p>Keeper team: {keeperTeam}</p>
      </div>
    );
  }

  renderPlayers(players) {
    return (
      <div className="col-md-4">
        <h5>PLAYERS</h5>
        {(players || []).map(this.renderPlayer)}
      </div>
    );
  }

  renderNomination(nomination) {
    const { start_time, playerId, teamId, my_turn, pick_number } = nomination;
    const teamName = (this.getTeam(teamId) || {}).name;
    const playerName = (this.getPlayer(playerId) || {}).name;
    return (
      <div className="admin-nomination-view">
        <p>Team: {teamName}</p>
        <p>Player: {playerName}</p>
        <p>My turn: {my_turn ? 'yes' : 'no'}</p>
        <p>Pick number: {pick_number}</p>
      </div>
    );
  }

  renderNominations(nominationOrder) {
    return (
      <div className="col-md-4">
        <h5>NOMINATION ORDER</h5>
        {(nominationOrder || []).map(this.renderNomination)}
      </div>
    );
  }

  renderPrivsEditor() {
    const { usernameForCaptaincyEdit, giveOrRemoveCaptaincy,
            teamNameToGiveCaptaincy, typeToEdit, propToEdit,
            newValueForEdit, identifierForEdit } = this.props.draftState;
    return (
      <div className="col-md-6">
        <p>Give or remove captaincy:</p>
        <input type="text" placeholder="username" value={usernameForCaptaincyEdit} onChange={this.handleValueChange.bind(this, 'usernameForCaptaincyEdit')} />
        <input type="text" placeholder="give or remove" value={giveOrRemoveCaptaincy} onChange={this.handleValueChange.bind(this, 'giveOrRemoveCaptaincy')} />
        <input type="text" placeholder="team name (case sensitive)" value={teamNameToGiveCaptaincy} onChange={this.handleValueChange.bind(this, 'teamNameToGiveCaptaincy')} />
        <button onClick={this.editPrivs}>Execute</button>
      </div>
    );
  }

  renderDataEditor() {
    const editableTypes = [
      { type: 'team', props: ['captain', 'captain_is_npc', 'preliminary_pick', 'division', 'name', 'tag_coins', 'keeper_coins'] },
      { type: 'player', props: ['name', 'current_bid_amount', 'current_bid_team', 'keeper_team', 'is_nominated', 'is_selected' ] },
      { type: 'nomination', props: [ 'my_turn', 'roster_full', 'player' ] }
    ];
    const types = editableTypes.map((t) => {
      return <p>Type = {t.type} | props = {t.props.join(', ')}</p>;
    });
    const { usernameForCaptaincyEdit, giveOrRemoveCaptaincy,
            teamNameToGiveCaptaincy, typeToEdit, propToEdit,
            newValueForEdit, identifierForEdit } = this.props.draftState;
    return (
      <div className="col-md-6">
        <p>Manipulate these parts of the draft:</p>
        {types}
        <p>Identifier will be team name for team edits, pick number for nomination edits, or player name for player edits</p>
        <input type="text" placeholder="type" value={typeToEdit} onChange={this.handleValueChange.bind(this, 'typeToEdit')} />
        <input type="text" placeholder="prop" value={propToEdit} onChange={this.handleValueChange.bind(this, 'propToEdit')} />
        <input type="text" placeholder="new value" value={newValueForEdit} onChange={this.handleValueChange.bind(this, 'newValueForEdit')} />
        <input type="text" placeholder="identifier" value={identifierForEdit} onChange={this.handleValueChange.bind(this, 'identifierForEdit')} />
        <button onClick={this.editData}>Execute</button>
      </div>
    );
  }

  render() {
    const { teams, players, draft, nominationOrder } = this.props.draftState;
    return (
      <div className="draft-edit-view">
        <div className="row">
          {this.renderTeams(teams)}
          {this.renderPlayers(players)}
          {this.renderNominations(nominationOrder)}
        </div>
        <div className="row">
          {this.renderPrivsEditor()}
          {this.renderDataEditor()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.editDraft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminEditView);
