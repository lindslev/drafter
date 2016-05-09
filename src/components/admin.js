import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/draft';

class AdminView extends React.Component {
  constructor(props) {
    super(props);
    this.createDraft = this.createDraft.bind(this);
  }

  createDraft() {
    const teams = [ { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null },
  { teamName: 'name1', captainName: 'player1', isNPC: false, preliminaryPick: null } ];
    const signups = '1tXHrJnO8vebqN8AY6sGoJt19VUSB36Tao8hK4QOfOS0';
    const keepers = '1JX2f6lwMTXwwhegqR16fygh5ipbmsTDbwQWngsBAgwQ';
    const { createDraft } = this.props.draftActions;
    const draft = {
      seasonNumber: 10,
      teams,
      tagCoins: 100,
      keeperCoins: 10,
      signupSheet: signups,
      legacySheet: keepers,
      numSignups: 1000,
      draftRounds: 3,
      manualDraftOrder: null
    };
    createDraft(draft)
      .then(() => window.alert('kappa'))
      .catch(() => window.alert('qakka'));
  }

  render() {
    return (
      <div>
        <button onClick={this.createDraft}>CREATE</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.draft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminView);
