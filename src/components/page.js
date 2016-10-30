import React from 'react';

class Page extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const canRenderAdminRoutes = this.checkAuthentication();
    if ( !canRenderAdminRoutes ) {
      window.location = '/';
    }
  }

  checkAuthentication() {
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isAdmin = localStorage.getItem('drafterUserIsAdmin') === "true";
    const canRenderAdminRoutes = isLoggedIn && isAdmin;
    return canRenderAdminRoutes;
  }

  render() {
    const canRenderAdminRoutes = this.checkAuthentication();
    return canRenderAdminRoutes ? this.props.children : null;
  }
}

export default Page;
