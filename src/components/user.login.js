import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActions from '../redux/modules/user';

class UserLoginView extends React.Component {
  constructor(props) {
    super(props);
    this.createUser = this.createUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  createUser() {
    const { createUser } = this.props.userActions;
    const { usernameToCreate, passwordToCreate } = this.props.userState;
    if ( usernameToCreate && passwordToCreate ) {
      createUser(usernameToCreate, passwordToCreate).then(() => {
        window.alert('Account created. You can now log in!');
      }).catch((err) => {
        window.alert('There was an error creating this account.');
      });
    } else {
      window.alert('Missing either username or password.');
    }
  }

  loginUser() {
    const { loginUser } = this.props.userActions;
    const { usernameToLogin, passwordToLogin } = this.props.userState;
    if ( usernameToLogin && passwordToLogin ) {
      loginUser(usernameToLogin, passwordToLogin).then((user) => {
        const { username, id, teamId, is_admin, is_captain } = user;
        const ls = window.localStorage || localStorage;
        ls.setItem('drafterUsername', username);
        ls.setItem('drafterUserIsAdmin', is_admin);
        ls.setItem('drafterUserIsCaptain', is_captain);
        ls.setItem('drafterUserId', id);
        ls.setItem('drafterUserTeamId', teamId);
        window.location = '/';
      }).catch((err) => {
        window.alert('There was an error logging in.');
      });
    } else {
      window.alert('Missing either username or password.');
    }
  }

  handleValueChange(key, { target }) {
    const { setProperty } = this.props.userActions;
    setProperty(key, target.value);
  }

  render() {
    const { usernameToCreate, passwordToCreate,
            usernameToLogin, passwordToLogin } = this.props.userState;
    return (
      <div className="user-login-view">
        <div className="row">
          <div className="col-lg-6">
            <p>Create Account</p>
            <input type="text" placeholder="username" value={usernameToCreate} onChange={this.handleValueChange.bind(this, 'usernameToCreate')} />
            <input type="password" placeholder="password" value={passwordToCreate} onChange={this.handleValueChange.bind(this, 'passwordToCreate')}/>
            <button onClick={this.createUser}>Create Account</button>
          </div>
          <div className="col-lg-6">
            <p>Log In</p>
            <input type="text" placeholder="username" value={usernameToLogin} onChange={this.handleValueChange.bind(this, 'usernameToLogin')} />
            <input type="password" placeholder="password" value={passwordToLogin} onChange={this.handleValueChange.bind(this, 'passwordToLogin')} />
            <button onClick={this.loginUser}>Log In</button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    userState: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
    userActions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLoginView);
