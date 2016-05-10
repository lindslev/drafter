import React from 'react';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const loggedInUser = false;
    return (
      <div className="header">
        <p className="header-title">Drafter</p>
        <p className="header-right">{loggedInUser ? loggedInUser.username : 'Log In'}</p>
      </div>
    );
  }
}

export default Header;
