import React from 'react';

class DraftBid extends React.Component {
  constructor(props) {
    super(props);
    this.getTeam = this.getTeam.bind(this);
    this.renderAdminView = this.renderAdminView.bind(this);
    this.renderCaptainView = this.renderCaptainView.bind(this);
    this.renderSpectatorView = this.renderSpectatorView.bind(this);
    this.renderNom = this.renderNom.bind(this);
    this.renderNominationOrder = this.renderNominationOrder.bind(this);
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

  renderAdminView() {
    const { nominationOrder, nominations } = this.props;
    const currentNomination = 1;
    const playersLeft = nominations.length - currentNomination;
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
        {this.renderNominationDetails(currentNomination, playersLeft)}
      </div>
    );
  }

  renderNom(n, i) {
    const teamName = (this.getTeam(n.teamId) || {}).name;
    return <p key={i}>{n.pick_number}. {teamName}</p>;
  }

  renderNominationDetails(currentNomination, playersLeft) {
    return (
      <div className="nomination-details">
        <p><span className="bold">Last pick:</span> ---</p>
        <p><span className="bold">Nominating:</span> PrivateMajor</p>
        <p className="smaller">(nomination #{currentNomination} overall)</p>
        <p><span className="bold">Up next:</span> Stann</p>
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
    const { nominationOrder, nominations } = this.props;
    const currentNomination = 1;
    const playersLeft = nominations.length - currentNomination;
    return (
      <div>
        <div className="captain-bidding-section">
          <input
            className="nomination-input"
            type="text"
            placeholder="nomination" />
          <input
            className="bid-input"
            type="text"
            placeholder="bid" />
          <button className="auto-bid">+1</button>
          <button className="auto-bid">+2</button>
          <button className="auto-bid">+3</button>
        </div>
        <div className="nomination-order">
          <p>Nomination Order</p>
          {this.renderNominationOrder(nominationOrder)}
        </div>
        {this.renderNominationDetails(currentNomination, playersLeft)}
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
