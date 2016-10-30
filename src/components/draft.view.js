import React from 'react';
import { findIndex, sortBy, filter } from 'lodash';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as editActions from '../redux/modules/edit';
import * as runActions from '../redux/modules/run';

import Bid from './draft.bid';
import Info from './draft.info';
import Teams from './draft.teams';
import Chat from './draft.chat';

function rotateArray(array, times) {
  array = array.slice();
  while(times--){
    var temp = array.shift();
    array.push(temp)
  }
  return array;
}

function getNext(nominations, pickNumber) {
  let idx;
  let nomination;
  let originalNomination;
  let tempNoms = nominations;
  for (idx=0; idx<nominations.length; idx++) {
    nomination = nominations[idx];
    if (nomination.pick_number === pickNumber) {
      break;
    }
  }

  tempNoms = rotateArray(tempNoms, idx);
  originalNomination = tempNoms.shift() || {};

  let broke = false;

  for (idx=0; idx<tempNoms.length; idx++) {
    nomination = tempNoms[idx];
    if (!nomination.roster_full) {
      broke = true;
      break;
    }
  }
  if (!broke) {
    if (originalNomination.roster_full) {
      nomination = undefined;
    } else {
      nomination = originalNomination;
    }
  }
  return nomination;
}

class DraftView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.editActions.loadDraft(this.props.routeParams.id);
  }

  getTeam(idOrName, teams) {
    let team;
    (teams || []).forEach((t) => {
      if ( +idOrName === +t.id || idOrName === t.name ) {
        team = t;
      }
    });
    return team;
  }

  render() {
    const { teams, nominationOrder, players } = this.props.editState;
    const { stream, userChatMessage, captainNomination, bidBlock,
            captainBid, nominatedPlayer, lastBid, time, timerRunning } = this.props.runState;
    const { bidOnNomination, setProperty, nominatePlayer,
            winPlayer } = this.props.runActions;
    const currentNomination = nominationOrder[findIndex(nominationOrder, (n) => n.my_turn)] || {};
    const currentlyNominating = this.getTeam(currentNomination.teamId, teams);
    const nextUp = getNext(nominationOrder, currentNomination.pick_number) || {};
    const selectedPlayers = filter(players, (p) => p.is_selected);
    const lastPlayerPicked = (sortBy(selectedPlayers, (p) => p.updatedAt).reverse())[0] || {};
    const picksLeft = 48 - selectedPlayers.length;
    return (
      <div className="draft-view">
        <Info
          nextUp={nextUp}
          picksLeft={picksLeft}
          lastPlayerPicked={lastPlayerPicked}
          currentNom={currentNomination}
          nominationOrder={nominationOrder || []}
          selectedPlayers={selectedPlayers}
          teams={teams || []} />
        <Teams
          players={players}
          teams={teams || []} />
        <aside className="right">
          <Bid
            bidBlock={bidBlock}
            currentNom={currentNomination}
            timerRunning={timerRunning}
            bidOnNomination={bidOnNomination}
            captainBid={captainBid}
            lastBid={lastBid}
            nominatePlayer={nominatePlayer}
            nominatedPlayer={nominatedPlayer}
            nominationOrder={nominationOrder || []}
            selectedPlayers={selectedPlayers}
            players={players || []}
            teams={teams || []}
            captainNomination={captainNomination}
            setProperty={setProperty}
            time={time}
            nextUp={currentlyNominating} />
          <Chat
            winPlayer={winPlayer}
            socket={this.props.socket}
            stream={stream}
            userChatMessage={userChatMessage}
            setProperty={setProperty}
            nominationOrder={nominationOrder || []}
            captainNomination={captainNomination}
            captainBid={captainBid}
            timerRunning={timerRunning}
            currentNom={currentNomination} />
        </aside>
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
