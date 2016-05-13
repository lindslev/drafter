import React from 'react';
import { findIndex } from 'lodash';

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
    const { lastBid, timerRunning } = this.props;
    const didntMakeLastBid = +lastBid.teamId !== this.teamId;
    const enoughCoins = this.enoughCoins();
    return myTurn && !timerRunning || (timerRunning && didntMakeLastBid && enoughCoins);
  }

  enoughCoins() {
    const { nominatedPlayer, lastBid } = this.props;
    const myTeam = this.getTeam(this.teamId) || {};
    const playerObj = this.getPlayer(nominatedPlayer) || {};
    const isKeeper = +playerObj.keeper_team === this.teamId;
    const coinsToSpend = isKeeper ? +myTeam.tag_coins + Math.min(5, +myTeam.keeper_coins || 0) : +myTeam.tag_coins;
    const lastBidPrice = lastBid.coins;
    return coinsToSpend > lastBidPrice;
  }

  canNominate() {

  }

  getCurrentNomination(nominations) {
    const currentNomIndex = findIndex(nominations, (n) => !n.is_done);
    if ( currentNomIndex === null || currentNomIndex === undefined ) return {};
    const current = nominations[currentNomIndex] || {};
    const last = nominations[currentNomIndex- 1];
    const next = nominations[currentNomIndex + 1];
    const currentTeam = this.getTeam((current || {}).teamId) || {};
    const lastTeam = this.getTeam((last || {}).teamId) || {};
    const nextTeam = this.getTeam((next || {}).teamId) || {};
    return { currentNom: current, currentTeam, lastTeam, nextTeam };
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
    const { currentNom } = this.getCurrentNomination(this.props.nominations);
    const { players, setProperty, captainNomination, nominatePlayer, captainBid } = this.props;
    const playerIndex = findIndex(players, (p) => p.name === captainNomination);
    const isSignedUp = playerIndex > -1;
    const isNotSelected = !(players[playerIndex] || {}).is_selected;
    if ( isSignedUp && isNotSelected ) {
      const teamId = this.teamId;
      nominatePlayer(captainNomination, teamId, currentNom.id, captainBid);
      setProperty('captainBid', 0);
      setProperty('captainNomination', '');
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
    const { currentNom } = this.getCurrentNomination(this.props.nominations);
    const { setProperty, teams, captainBid, bidOnNomination,
            nominatedPlayer, lastBid, timerRunning } = this.props;
    const haveEnoughCoins = this.enoughCoins();
    const lastBidPrice = +lastBid.coins;
    const myBid = coins ? lastBidPrice + +coins : captainBid;
    const didntMakeLastBid = +lastBid.teamId !== this.teamId;
    const eligibleBid = myBid > lastBidPrice && haveEnoughCoins && didntMakeLastBid && timerRunning;
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
    const { nominationOrder, nominations } = this.props;
    return (
      <div>
        <div className="admin-bidding-section">
          <button className="admin-pause">Pause draft</button>
          <p className="admin-button-disclosure">This button will disable captains from continuing with bids and nominations. If used in the middle of a nomination, the nomination will be restarted.</p>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder(nominationOrder)}
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
    const { nominations } = this.props;
    const { currentNom, currentTeam, lastTeam, nextTeam } = this.getCurrentNomination(nominations);
    const currentPickNum = currentNom ? currentNom.pick_number : 1;
    const playersLeft = nominations.length - currentPickNum;
    return (
      <div className="nomination-details">
        <p><span className="bold">Last pick:</span> {lastTeam.name ? lastTeam.name : '---'}</p>
        <p><span className="bold">Nominating:</span> {currentTeam.name ? currentTeam.name : '---'}</p>
        <p className="smaller">(nomination #{currentPickNum} overall)</p>
        <p><span className="bold">Up next:</span> {nextTeam.name ? nextTeam.name : '---'}</p>
        <p><span className="bold">{playersLeft}</span> picks left</p>
      </div>
    );
  }

  renderNominationOrder(order) {
    return (
      <div className="order-list">
        {order.map(this.renderNom)}
      </div>
    );
  }

  renderCaptainView() {
    const { nominationOrder, nominations, captainNomination,
            captainBid, lastBid, timerRunning } = this.props;
    const localStorage = window.localStorage || localStorage;
    const teamId = this.teamId;
    const { currentNom } = this.getCurrentNomination(nominations);
    const nextNom = this.getCaptainsNextNom(nominations, +teamId);
    const thisTurn = +currentNom.teamId === +teamId;
    let picksAway = thisTurn ? 'now' : `${+nextNom.pick_number - +currentNom.pick_number} picks away`;
    if ( !nextNom.pick_number ) picksAway = '---';
    const nomDisabled = !thisTurn || timerRunning;
    const canBid = this.canBid(thisTurn);
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
          <p>Your next turn: {picksAway}</p>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder(nominationOrder)}
        </div>
        {this.renderNominationDetails()}
      </div>
    );
  }

  renderSpectatorView() {
    const { nominationOrder, nominations } = this.props;
    const currentNomination = 1;
    const playersLeft = nominations.length - currentNomination;
    return (
      <div>
        <div className="spectator-bidding-section">
          <p className="spectator-title">MLTP Draft</p>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder(nominationOrder)}
        </div>
        {this.renderNominationDetails(currentNomination, playersLeft)}
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
