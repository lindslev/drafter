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
    const { teams, nominations, players } = this.props.editState;
    const { stream, userChatMessage, captainNomination,
            captainBid, nominatedPlayer, lastBid } = this.props.runState;
    const { bidOnNomination, setProperty, nominatePlayer } = this.props.runActions;
    const nominationOrder = this.getNominationOrder(teams, nominations);
    return (
      <div className="draft-view">
        <Chat
          nominatedPlayer={nominatedPlayer}
          socket={this.props.socket}
          stream={stream}
          userChatMessage={userChatMessage}
          setProperty={setProperty} />
        <Bid
          bidOnNomination={bidOnNomination}
          captainBid={captainBid}
          lastBid={lastBid}
          nominatePlayer={nominatePlayer}
          nominatedPlayer={nominatedPlayer}
          nominationOrder={nominationOrder}
          nominations={nominations || []}
          players={players || []}
          teams={teams || []}
          captainNomination={captainNomination}
          setProperty={setProperty} />
        <Teams
          teams={teams || []} />
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
