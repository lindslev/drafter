import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/create';

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.createDraft = this.createDraft.bind(this);
    this.executeAddTeamsFlow = this.executeAddTeamsFlow.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.renderMiscInputs = this.renderMiscInputs.bind(this);
  }

  createDraft() {
    const { createDraft } = this.props.draftActions;
    const { seasonNumber, teams, tagCoins, keeperCoins,
            signupSheet, legacySheet, numSignups,
            draftRounds } = this.props.draftState;
    const draft = {
      seasonNumber: +seasonNumber,
      teams,
      tagCoins: +tagCoins,
      keeperCoins: +keeperCoins,
      signupSheet,
      legacySheet,
      numSignups: +numSignups,
      draftRounds: +draftRounds
    };

    const missingFields = this.checkMissingFields(draft);
    if ( !missingFields ) {
      createDraft(draft)
        .then((draft) => {
          const { draftId } = draft;
          window.alert('Draft created!');
          window.location = `/admin/edit/${draftId}`;
        }).catch((err) => {
          window.alert('There was an issue creating the draft. See Gem.');
        });
    } else {
      window.alert('Fields missing: ' + missingFields);
    }
  }

  checkMissingFields(draft) {
    const missingKeys = [];
    Object.keys(draft).forEach((key) => {
      if ( !draft[key] ) missingKeys.push(key);
    });
    return missingKeys.length > 0 ? missingKeys.join(', ') : null;
  }

  executeAddTeamsFlow() {
    let numberOfTeams = window.prompt('How many teams?');
    const teamsToAdd = numberOfTeams;
    const teams = [];
    let cancelledFlow = false;
    if ( numberOfTeams ) {
      while ( numberOfTeams-- ) {
        const teamName = window.prompt('Team name:');
        const captainName = window.prompt('Captain name:');
        const isNPC = window.prompt('Is the captain an NPC? y/n') === 'y' ? true : false;
        const preliminaryPick = window.prompt('If the captain is an NPC, please name their preliminary pick.');
        const division = window.prompt('What division is this team?');
        if ( !teamName || !captainName || !division ) {
          window.alert('Cancelling teams setup.');
          cancelledFlow = true;
          break;
        }
        teams.push({ teamName, captainName, isNPC, preliminaryPick, division });
      }
      if ( teams.length === Number(teamsToAdd) ) {
        const { setDraftProperty } = this.props.draftActions;
        setDraftProperty('teams', teams);
        window.alert('Teams set!');
      } else if ( !cancelledFlow ) {
        window.alert('Incorrect number of teams added.');
      }
    }
  }

  handleValueChange(key, { target }) {
    const { setDraftProperty } = this.props.draftActions;
    setDraftProperty(key, target.value);
  }

  renderMiscInputs() {
    const { seasonNumber, draftRounds,
            signupSheet, legacySheet, numSignups,
            tagCoins, keeperCoins } = this.props.draftState;
    return (
      <div>
        <p className="input-label">Season Number</p>
        <input type="number" value={seasonNumber} onChange={this.handleValueChange.bind(this, 'seasonNumber')} />
        <p className="input-label">Tagcoins per Team</p>
        <input type="number" value={tagCoins} onChange={this.handleValueChange.bind(this, 'tagCoins')}/>
        <p className="input-label">Keeper Coins per Legacy Team</p>
        <input type="number" value={keeperCoins} onChange={this.handleValueChange.bind(this, 'keeperCoins')}/>
        <p className="input-label">Number of Signups In Sheet</p>
        <input type="number" value={numSignups} onChange={this.handleValueChange.bind(this, 'numSignups')}/>
        <p className="input-label">Number of Auction Draft Rounds</p>
        <input type="number" value={draftRounds} onChange={this.handleValueChange.bind(this, 'draftRounds')}/>
        <p className="input-label">Signup Sheet ID <span className="side-note">*Reminder: Signups must be the first sheet in the packet. Sheet must be published to web (File > Publish To Web).</span></p>
        <input type="text" value={signupSheet} onChange={this.handleValueChange.bind(this, 'signupSheet')}/>
        <p className="input-label">Keeper Sheet ID <span className="side-note">*Reminder: See Mr.Gone for sheet format. Sheet must be published to web (File > Publish to Web).</span></p>
        <input type="text" value={legacySheet} onChange={this.handleValueChange.bind(this, 'legacySheet')}/>
      </div>
    );
  }

  render() {
    return (
      <div className="draft-create-view">
        <h5 className="view-title">Create a New Draft</h5>
        {this.renderMiscInputs()}
        <button className="add-teams" onClick={this.executeAddTeamsFlow}>Add Team Data</button>
        <button className="create-draft-button"onClick={this.createDraft}>CREATE</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.createDraft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminView);
