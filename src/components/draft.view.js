import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as editActions from '../redux/modules/edit';
import * as runActions from '../redux/modules/run';

import Bid from './draft.bid';
import Teams from './draft.teams';
import Chat from './draft.chat';

class DraftView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.editActions.loadDraft(7);
  }

  getNominationOrder(teams, nominations) {
    return (nominations || []).slice(0, (teams || []).length);
  }

  render() {
    const { teams, nominations } = this.props.editState;
    const nominationOrder = this.getNominationOrder(teams, nominations);
    return (
      <div className="draft-view">
        <Bid nominationOrder={nominationOrder} nominations={nominations || []} teams={teams || []} />
        <Teams teams={teams || []} />
        <Chat />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    editState: state.editDraft,
    runState: state.runDraft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    editActions: bindActionCreators(editActions, dispatch),
    runActions: bindActionCreators(runActions, dispatch)
  };
}

// CAPTAIN FEATURES OF DRAFT:
// custom number entry
// chat
// default bids +1 +2 +5
// bid delay after former bid

// ADMIN FEATURES:
// pausing / resuming (if paused, captains can't do shit)
// chat

// SPEC FEATURES:
// nothin get got nerds
export default connect(mapStateToProps, mapDispatchToProps)(DraftView);
