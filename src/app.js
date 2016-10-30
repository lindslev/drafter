import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import createStore from './redux/create';

const socket = io();

import Header from './components/header';

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    );
  }
}

const store = createStore({});

import initializeListeners from './socket';
initializeListeners(socket, store);

import Home from './components/home';
import Page from './components/page';
import AdminCreateView from './components/admin.create';
import AdminEditView from './components/admin.edit';
import DraftView from './components/draft.view';
import UserLogin from './components/user.login';

function createElement(Component, props) {
  props.socket = socket;
  return <Component {...props} />;
}

const APP = (
  <Provider store={store}>
    <Router history={browserHistory} createElement={createElement}>
      <Route path='/' component={App}>
        <IndexRoute component={Home} />
        <Route path='auction/:id' component={DraftView} />
        <Route path='admin' component={Page}>
          <Route path='create' component={AdminCreateView} />
          <Route path='edit/:id' component={AdminEditView} />
        </Route>
        <Route path='login' component={UserLogin} />
      </Route>
    </Router>
  </Provider>
);

ReactDOM.render(APP, document.getElementById('app'));
