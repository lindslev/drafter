import React from 'react';
import ReactDOM from 'react-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/draft';

class AdminView extends React.Component {
  componentWillMount() {
    const { loadTeams } = this.props.draftActions;
    loadTeams();
  }

  render() {
    console.log('props', this.props);
    return (
      <div>
        <p>dis where we gonna let admins do stuff WOO</p>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.draft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminView);
