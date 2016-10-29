import React from 'react';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.getRightText = this.getRightText.bind(this);
    this.loginHandler = this.loginHandler.bind(this);
  }

  isLoggedIn() {
    const localStorage = window.localStorage || localStorage;
    return !!localStorage.getItem('drafterUserId');
  }

  getRightText() {
    return this.isLoggedIn() ? (window.localStorage || localStorage).getItem('drafterUsername') : 'Log In';
  }

  loginHandler() {
    if ( !this.isLoggedIn() ) {
      window.location = '/login';
    }
  }
  
  render() {
    return (
      <div className="header">
        <p className="header-title">Drafter</p>
        <p onClick={this.loginHandler} className="header-right">{this.getRightText()}</p>
      </div>
    );
  }
}

export default Header;
