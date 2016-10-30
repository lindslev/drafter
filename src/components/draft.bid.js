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
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.renderNominationActive = this.renderNominationActive.bind(this);
    this.renderNominationWaiting = this.renderNominationWaiting.bind(this);
    this.renderNominationForm = this.renderNominationForm.bind(this);
    this.renderTopSection = this.renderTopSection.bind(this);
    this.renderBiddingConsole = this.renderBiddingConsole.bind(this);
  }

  canBid(myTurn) {
    const { lastBid, timerRunning } = this.props;
    const didntMakeLastBid = +lastBid.teamId !== this.teamId;
    const enoughCoins = this.enoughCoins();
    // NEED TO CHECK IF ROSTER IS FULL!!!!!!!!
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
    const { currentNom } = this.props;
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
    const { currentNom } = this.props;
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

  renderBiddingConsole() {
    const { nominations, captainBid, lastBid, currentNom } = this.props;
    const localStorage = window.localStorage || localStorage;
    const teamId = this.teamId;
    // const nextNom = this.getCaptainsNextNom(nominations, +teamId);
    // const nextNom = {};
    const thisTurn = +currentNom.teamId === +teamId;
    // let picksAway = thisTurn ? 'now' : `${+nextNom.pick_number - +currentNom.pick_number} picks away`;
    // if ( !nextNom.pick_number ) picksAway = '---';
    const canBid = this.canBid(thisTurn);
    return (
      <div className="bidding-console">
        <input
          disabled={!canBid}
          onKeyDown={this.handleKeyDown.bind(this, 'bid')}
          value={captainBid}
          onChange={this.handleValueChange.bind(this, 'captainBid')}
          className="bid-input"
          type="number"
          placeholder="bid" />
        <button disabled={!canBid} onClick={this.autoBid.bind(this, 1)} className="bid-button">+1</button>
        {/*<p>Your next turn: {picksAway}</p>*/}
      </div>
    );
  }

  renderNominationWaiting() {
    const { nextUp } = this.props;
    return (
      <div className="nom-wrapper">
        <div className="nominator">{(nextUp || {}).name}</div>
        <div className="nominating-text">is now nominating</div>
      </div>
    );
  }

  renderNominationForm() {
    const { captainNomination } = this.props;
    return (
      <div className="nom-wrapper">
        <div className="nom-player-label">Nominate a player</div>
        <input
          value={captainNomination}
          onKeyDown={this.handleKeyDown.bind(this, 'nom')}
          onChange={this.handleValueChange.bind(this, 'captainNomination')}
          className="nominate-player"
          type="text" />
      </div>
    );
  }

  renderNominationActive() {
    const { nominatedPlayer, time, lastBid } = this.props;
    return (
      <div className="nom-wrapper">
        <div className="nom-name">{nominatedPlayer}</div>
        <div className="nom-data">
          <span className="coins">
            <i className="material-icons">monetization_on</i>
            <span className="amount">{lastBid.coins < 10 ? "0" + lastBid.coins : lastBid.coins}</span>
          </span>
          <span className="time-remaining">
            <i className="material-icons">schedule</i>
            <span className="amount">{time < 10 ? "0" + time : time}</span>
          </span>
        </div>
      </div>
    );
  }

  renderTopSection() {
    let view = 'Waiting';
    const { time, nextUp, timerRunning, currentNom } = this.props;
    const waiting = time === 0;
    const localStorage = window.localStorage || localStorage;
    const teamId = this.teamId;
    const thisTurn = +currentNom.teamId === +teamId;
    const nomDisabled = !thisTurn || timerRunning;
    if ( !waiting ) view = 'Active';
    else if ( !nomDisabled ) view = 'Form';
    const renderView = this[`renderNomination${view}`];

    return (
      <div className="current-nom">
        {renderView()}
      </div>
    );
  }

  render() {
    let view = 'Spectator';
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isCaptain = localStorage.getItem('drafterUserIsCaptain') === "true";

    return (
      <div className="nom-console nom-console-west">
        {this.renderTopSection()}
        {isLoggedIn && isCaptain ? this.renderBiddingConsole() : null}
      </div>
    );
  }
}

export default DraftBid;
