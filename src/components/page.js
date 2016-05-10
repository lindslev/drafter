import React from 'react';

class Page extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.children;
  }
}

export default Page; 
