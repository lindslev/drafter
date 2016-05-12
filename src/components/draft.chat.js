import React from 'react';
import classnames from 'classnames';
import moment from 'moment';

class DraftChat extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.sendChat = this.sendChat.bind(this);
    this.renderChatBox = this.renderChatBox.bind(this);
    this.renderTopSection = this.renderTopSection.bind(this);
    this.renderChatStream = this.renderChatStream.bind(this);
  }

  handleKeyDown({ keyCode }) {
    if ( keyCode === 13 ) {
      this.sendChat();
    }
  }

  handleValueChange(key, { target }) {
    const { setProperty } = this.props;
    setProperty(key, target.value);
  }

  sendChat() {
    const { userChatMessage, setProperty, socket } = this.props;
    const localStorage = window.localStorage || localStorage;
    const username = localStorage.getItem('drafterUsername');
    const message = {
      username,
      type: 'message',
      sent: new Date(),
      message: `: ${userChatMessage}`
    };
    socket.emit('send-chat-message', message);
    setProperty('userChatMessage', '');
  }

  renderChatBox() {
    return (
      <div className="chat-box">
        <input
          onKeyDown={this.handleKeyDown}
          onChange={this.handleValueChange.bind(this, 'userChatMessage')} 
          value={userChatMessage}
          type="text"
          placeholder="send a chat message" />
        <button onClick={this.sendChat}>Send</button>
      </div>
    );
  }

  renderTopSection() {
    const { userChatMessage } = this.props;
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isCaptain = localStorage.getItem('drafterUserIsCaptain') === "true";
    const isAdmin = localStorage.getItem('drafterUserIsAdmin') === "true";
    const canChat = isLoggedIn && (isCaptain || isAdmin);
    return (
      <div className="chat-top-section">
        <div className="awaiting">
          <p>Tpr <span className="timer">11.0s</span></p>
        </div>
        {canChat ? this.renderChatBox(): null}
      </div>
    );
  }

  renderChatStream(chats) {
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
    const { stream } = this.props;
    return (
      <div className="draft-chat">
        {this.renderTopSection()}
        {this.renderChatStream(stream)}
      </div>
    );
  }
}

export default DraftChat;
