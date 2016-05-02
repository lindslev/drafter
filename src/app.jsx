import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
    const x = 4;
    return (
      <div>
        <p>The variable x = {x}</p>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
