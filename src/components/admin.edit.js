import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/edit';

class AdminEditView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.draftActions.loadDraft(this.props.routeParams.id);
  }

  render() {
    console.log(this.props);
    return (
      <div className="draft-edit-view">
      EDIT THINGS
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.editDraft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminEditView);
