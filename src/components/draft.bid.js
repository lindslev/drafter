import React from 'react';
import { findIndex, filter } from 'lodash';

class DraftBid extends React.Component {
  constructor(props) {
    super(props);
    const localStorage = window.localStorage || localStorage;
    this.teamId = +localStorage.getItem('drafterUserTeamId');
    this.canBid = this.canBid.bind(this);
    this.canNominate = this.canNominate.bind(this);
    this.enoughCoins = this.enoughCoins.bind(this);
    this.nominate = this.nominate.bind(this);
    this.autoBid = this.autoBid.bind(this);
    this.bid = this.bid.bind(this);
    this.getTeam = this.getTeam.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.getCurrentNomination = this.getCurrentNomination.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.renderAdminView = this.renderAdminView.bind(this);
    this.renderCaptainView = this.renderCaptainView.bind(this);
    this.renderSpectatorView = this.renderSpectatorView.bind(this);
    this.renderNom = this.renderNom.bind(this);
    this.renderNominationOrder = this.renderNominationOrder.bind(this);
    this.renderNominationDetails = this.renderNominationDetails.bind(this);
  }

  canBid(myTurn) {
    const { lastBid, timerRunning, selectedPlayers } = this.props;
    const didntMakeLastBid = +lastBid.teamId !== this.teamId;
    const enoughCoins = this.enoughCoins(0);
    const rosterFull = this.rosterFull(this.teamId, selectedPlayers); 
    return myTurn && !timerRunning && !rosterFull || (timerRunning && didntMakeLastBid && enoughCoins && !rosterFull);
  }

  rosterFull(teamId, selectedPlayers) {
    const roster = filter(selectedPlayers, (p) => {
      return +p.current_bid_team === teamId;
    });
    return roster.length === 3;
  }

  enoughCoins(myBid) {
    const { nominatedPlayer, lastBid, timerRunning, captainNomination } = this.props;
    const myTeam = this.getTeam(this.teamId) || {};
    const playerToUse = timerRunning ? nominatedPlayer : captainNomination;
    const playerObj = this.getPlayer(playerToUse) || {};
    const isKeeper = +playerObj.keeper_team === this.teamId;
    const coinsToSpend = isKeeper ? +myTeam.tag_coins + Math.min(5, +myTeam.keeper_coins || 0) : +myTeam.tag_coins;
    const lastBidPrice = lastBid.coins || -1;
    return coinsToSpend > lastBidPrice && +myBid <= coinsToSpend;
  }

  canNominate() {

  }

  getCurrentNomination() {
    const { currentNom, lastPlayerPicked, nextUp } = this.props;
    const currentTeam = this.getTeam((currentNom || {}).teamId) || {};
    const lastTeamObj = this.getTeam(+lastPlayerPicked.current_bid_team) || {};
    const lastTeam = lastPlayerPicked.name ? `${lastPlayerPicked.name} to ${lastTeamObj.name}` : '---';
    const nextTeam = this.getTeam((nextUp || {}).teamId) || {};
    return { currentNom, currentTeam, lastTeam, nextTeam };
  }

  getCaptainsNextNom(nominations, teamId) {
    return nominations[findIndex(nominations, (n) => !n.is_done && n.teamId === teamId)] || {};
  }

  getTeam(idOrName) {
    const { teams } = this.props;
    let team;
    (teams || []).forEach((t) => {
      if ( +idOrName === +t.id || idOrName === t.name ) {
        team = t;
      }
    });
    return team;
  }

  getPlayer(idOrName) {
    const { players } = this.props;
    let player;
    (players || []).forEach((p) => {
      if ( +idOrName === +p.id || idOrName === p.name ) {
        player = p;
      }
    });
    return player;
  }

  nominate() {
    const { players, setProperty, captainNomination, 
            nominatePlayer, captainBid, currentNom } = this.props;
    const playerIndex = findIndex(players, (p) => p.name === captainNomination);
    const isSignedUp = playerIndex > -1;
    const isNotSelected = !(players[playerIndex] || {}).is_selected;
    const haveEnoughCoins = this.enoughCoins(captainBid); 
    if ( isSignedUp && isNotSelected && haveEnoughCoins ) {
      const teamId = this.teamId;
      nominatePlayer(captainNomination, teamId, currentNom.id, captainBid);
      setProperty('captainBid', 0);
      setProperty('captainNomination', '');
    } else if ( !haveEnoughCoins ) {
      window.alert('Not enough coins');
    } else if ( !isSignedUp ) {
      window.alert('Player not found');
    } else if ( !isNotSelected ) {
      window.alert('Player selected');
    }
  }

  autoBid(coins) {
    this.bid(coins);
  }

  bid(coins) {
    const { currentNom } = this.props;
    const { setProperty, teams, captainBid, bidOnNomination,
            nominatedPlayer, lastBid, timerRunning } = this.props;
    const lastBidPrice = +lastBid.coins;
    const myBid = coins ? lastBidPrice + +coins : captainBid;
    const haveEnoughCoins = this.enoughCoins(myBid);
    const didntMakeLastBid = +lastBid.teamId !== this.teamId;
    const eligibleBid = haveEnoughCoins && didntMakeLastBid && timerRunning;
    if ( eligibleBid ) {
      bidOnNomination(this.teamId, +myBid, +currentNom.id, nominatedPlayer);
    }
  }

  handleKeyDown(type, { keyCode }) {
    if ( keyCode === 13 ) {
      if ( type === 'nom' ) {
        this.nominate();
      }
      if ( type === 'bid' ) {
        this.bid();
      }
    }
  }

  handleValueChange(key, { target }) {
    const { setProperty } = this.props;
    setProperty(key, target.value);
  }

  renderAdminView() {
    return (
      <div>
        <div className="admin-bidding-section">
          <button className="admin-pause">Pause draft</button>
          <p className="admin-button-disclosure">This button will disable captains from continuing with bids and nominations. If used in the middle of a nomination, the nomination will be restarted.</p>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder()}
        </div>
        {this.renderNominationDetails()}
      </div>
    );
  }

  renderNom(n, i) {
    const teamName = (this.getTeam(n.teamId) || {}).name;
    return <p key={i}>{n.pick_number}. {teamName}</p>;
  }

  renderNominationDetails() {
    const { currentNom, currentTeam,
            lastTeam, nextTeam } = this.getCurrentNomination();
    const { picksLeft } = this.props;
    const currentPickNum = currentNom ? currentNom.pick_number : 1;
    return (
      <div className="nomination-details">
        <p><span className="bold">Last pick:</span> {lastTeam}</p>
        <p><span className="bold">Nominating:</span> {currentTeam.name ? currentTeam.name : '---'}</p>
        <p className="smaller">(nomination #{48 - (picksLeft - 1)} overall)</p>
        <p><span className="bold">Up next:</span> {nextTeam.name ? nextTeam.name : '---'}</p>
        <p><span className="bold">{picksLeft}</span> picks left</p>
      </div>
    );
  }

  renderNominationOrder() {
    const { nominationOrder: order } = this.props;
    return (
      <div className="order-list">
        {order.map(this.renderNom)}
      </div>
    );
  }

  renderCaptainView() {
    const { nominationOrder, nominations, captainNomination,
            captainBid, lastBid, timerRunning, currentNom, bidBlock } = this.props;
    const localStorage = window.localStorage || localStorage;
    const teamId = this.teamId;
    // const nextNom = this.getCaptainsNextNom(nominations, +teamId);
    // const nextNom = {};
    const thisTurn = +currentNom.teamId === +teamId;
    // let picksAway = thisTurn ? 'now' : `${+nextNom.pick_number - +currentNom.pick_number} picks away`;
    // if ( !nextNom.pick_number ) picksAway = '---';
    const nomDisabled = !thisTurn || timerRunning;
    const canBid = this.canBid(thisTurn) && !bidBlock;
    const autoBidClass = canBid ? `auto-bid` : `auto-bid-disabled`;
    return (
      <div>
        <div className="captain-bidding-section">
          <input
            value={captainNomination}
            onKeyDown={this.handleKeyDown.bind(this, 'nom')}
            onChange={this.handleValueChange.bind(this, 'captainNomination')}
            disabled={nomDisabled}
            className="nomination-input"
            type="text"
            placeholder="nomination" />
          <input
            disabled={!canBid}
            onKeyDown={this.handleKeyDown.bind(this, 'bid')}
            value={captainBid}
            onChange={this.handleValueChange.bind(this, 'captainBid')}
            className="bid-input"
            type="number"
            placeholder="bid" />
          <button disabled={!canBid} onClick={this.autoBid.bind(this, 1)} className={autoBidClass}>+1</button>
          <button disabled={!canBid} onClick={this.autoBid.bind(this, 2)} className={autoBidClass}>+2</button>
          <button disabled={!canBid} onClick={this.autoBid.bind(this, 3)} className={autoBidClass}>+3</button>
          {/*<p>Your next turn: {picksAway}</p>*/}
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder()}
        </div>
        {this.renderNominationDetails()}
      </div>
    );
  }

  renderSpectatorView() {
    return (
      <div>
        <div className="spectator-bidding-section">
          <img src="http://i.imgur.com/9SzGrqz.png" className="mltp-season-x"/>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder()}
        </div>
        {this.renderNominationDetails()}
      </div>
    );
  }

  render() {
    let view = 'Spectator';
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isAdmin = localStorage.getItem('drafterUserIsAdmin') === "true";
    const isCaptain = localStorage.getItem('drafterUserIsCaptain') === "true";
    if ( isLoggedIn && isCaptain ) view = 'Captain';
    if ( isLoggedIn && isAdmin ) view = 'Admin';
    const renderView = this[`render${view}View`];

    return (
      <div className="draft-bid">
        {renderView()}
      </div>
    );
  }
}

export default DraftBid;
