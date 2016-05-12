import React from 'react';
import classnames from 'classnames';
import moment from 'moment';

class DraftChat extends React.Component {
  constructor(props) {
    super(props);
    this.renderTopSection = this.renderTopSection.bind(this);
    this.renderChatStream = this.renderChatStream.bind(this);
  }

  renderCurrentNomination() {

  }

  renderTopSection() {
    return (
      <div className="chat-top-section">
        <div className="awaiting">
          <p>Ibis <span className="timer">11.0s</span></p>
        </div>
        <div className="chat-box">
          <input type="text" placeholder="send a chat message" />
          <button>Send</button>
        </div>
      </div>
    );
  }

  renderChatStream() {
    const chats = [{
      type: 'message',
      sent: new Date(),
      username: 'kappa',
      message: ': hey wassup hello seen yo pretty face soon as u walked thru the door'
    }, {
      type: 'bid',
      sent: new Date(),
      username: 'jjpoole',
      message: 'bids 1 on intercest'
    }, {
      type: 'nomination',
      sent: new Date(),
      username: 'Stann',
      message: 'nominates Gem with an initial bid of 0'
    }, {
      type: 'new_picker',
      sent: new Date(),
      username: null,
      message: 'PrivateMajor is now picking'
    }, {
      type: 'win',
      sent: new Date(),
      username: 'Curry',
      message: 'wins Ibis for 51!'
    }];
    return (
      <div className="chat-stream">
        {chats.map(this.renderChatLineItem)} 
      </div>
    );
  }

  renderChatLineItem(item, i) {
    const chatClass = classnames('chat-message', {
      'chat-nomination': item.type === 'nomination',
      'chat-win': item.type === 'win',
      'chat-bid': item.type === 'bid'
    });
    const chatString = `${moment(item.sent).fromNow()} | ${item.username ? item.username : ''} ${item.message}`;
    return (
      <div key={i} className={chatClass}>
        {chatString}
      </div>
    );
  }

  render() {
    return (
      <div className="draft-chat">
        {this.renderTopSection()}
        {this.renderChatStream()}
      </div>
    );
  }
}

export default DraftChat;
