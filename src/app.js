import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import createStore from './redux/create';

const socket = io();

class App extends React.Component {
  componentDidMount() {
    this.props.draftActions.loadTeams();
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

const store = createStore({});

import AdminView from './components/admin';

const APP = (
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={AdminView} />
        <Route path='admin' component={AdminView} />
      </Route>
    </Router>
  </Provider>
);

ReactDOM.render(APP, document.getElementById('app'));
