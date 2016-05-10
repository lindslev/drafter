import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as draftActions from '../redux/modules/run';

class DraftView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="draft-view">
      THE DRAFT.
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    draftState: state.runDraft
  };
}

function mapDispatchToProps(dispatch) {
  return {
    draftActions: bindActionCreators(draftActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DraftView);
