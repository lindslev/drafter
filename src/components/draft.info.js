import React from 'react';
import classnames from 'classnames';
import { findIndex, filter } from 'lodash';

class DraftInfo extends React.Component {
  constructor(props) {
    super(props);
    const localStorage = window.localStorage || localStorage;
    this.teamId = +localStorage.getItem('drafterUserTeamId');
    this.getTeam = this.getTeam.bind(this);
    this.getCurrentNomination = this.getCurrentNomination.bind(this);
    this.renderAdminControls = this.renderAdminControls.bind(this);
    this.renderBranding = this.renderBranding.bind(this);
    this.renderNom = this.renderNom.bind(this);
    this.renderNominationOrder = this.renderNominationOrder.bind(this);
    this.renderNominationDetails = this.renderNominationDetails.bind(this);
    this.renderUserInfo = this.renderUserInfo.bind(this);
  }

  getCurrentNomination() {
    const { currentNom, lastPlayerPicked, nextUp } = this.props;
    const lastTeamObj = this.getTeam(+lastPlayerPicked.current_bid_team) || {};
    const nextTeam = this.getTeam((nextUp || {}).teamId) || {};
    return { currentNom, lastPlayerPicked, lastTeamObj, nextTeam };
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

  renderUserInfo() {
    const localStorage = window.localStorage || localStorage;
    const username = localStorage.getItem('drafterUsername');
    return (
      <div className="userinfo">
        {username ?
          <div className="username">{username}</div>
          :
          <a className="username" href="/login">Log In</a>
        }
        <div className="prefs">
          <i className="material-icons">expand_more</i>
        </div>
      </div>
    );
  }

  renderAdminControls() {
    return (
      <div className="admin-bidding-section">
        <button className="admin-pause">Pause draft</button>
        <p className="admin-button-disclosure">This button will disable captains from continuing with bids and nominations. If used in the middle of a nomination, the nomination will be restarted.</p>
      </div>
    );
  }

  renderBranding() {
    return (
      <div className="branding-2">NLTP S8 Draft</div>
    );
  }

  renderNom(n, i) {
    const { currentNom } = this.getCurrentNomination();
    const { selectedPlayers } = this.props;
    const teamName = (this.getTeam(n.teamId) || {}).name;
    const className = classnames('', {
      'the-current-nom': +n.teamId === +currentNom.teamId,
      'nom-roster-full': this.rosterFull(n.teamId, selectedPlayers) 
    });
    return <li className={className} key={i}>{teamName}</li>;
  }

  rosterFull(teamId, selectedPlayers) {
    const roster = filter(selectedPlayers, (p) => {
      return +p.current_bid_team === teamId;
    });
    return roster.length === 4;
  }

  renderNominationDetails() {
    const { currentNom, lastPlayerPicked,
            lastTeamObj, nextTeam } = this.getCurrentNomination();
    const { picksLeft } = this.props;
    const currentPickNum = currentNom ? currentNom.pick_number : 1;
    return (
      <div className="draftinfo">
        <div className="inline">
          <div className="side-text">{48 - picksLeft}</div>
          <div className="side-title"> / 48</div>
        </div>
        <div>
          <div className="side-title">Last Pick</div>
          <div className="side-text">{lastPlayerPicked.name ? lastPlayerPicked.name : '---'}</div>
        </div>
        <div>
          <div className="side-title">To</div>
          <div className="side-text">{lastTeamObj.name ? lastTeamObj.name : '---'}</div>
        </div>
        <div>
          <div className="side-title">Nominating Next</div>
          <div className="side-text">{nextTeam.name ? nextTeam.name : '---'}</div>
        </div>
      </div>
    );
  }

  renderNominationOrder() {
    const { nominationOrder: order } = this.props;
    return (
      <div className="nom-order">
        <ol>
          {order.map(this.renderNom)}
        </ol>
      </div>
    );
  }

  render() {
    let view = 'Spectator';
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isAdmin = localStorage.getItem('drafterUserIsAdmin') === "true";

    return (
      <aside className="left">
        {this.renderUserInfo()}
        {/*isLoggedIn && isAdmin ? this.renderAdminControls() : null*/}
        {this.renderBranding()}
        {this.renderNominationDetails()}
        {this.renderNominationOrder()}
      </aside>
    );
  }
}

export default DraftInfo;
