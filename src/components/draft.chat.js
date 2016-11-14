import React from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { findIndex } from 'lodash';

class DraftChat extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.sendChat = this.sendChat.bind(this);
    this.renderChatBox = this.renderChatBox.bind(this);
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
    const { userChatMessage, setProperty, startTimer, socket } = this.props;
    const localStorage = window.localStorage || localStorage;
    const username = localStorage.getItem('drafterUsername');
    const message = {
      username,
      type: 'message',
      sent: new Date(),
      message: `${userChatMessage}`
    };
    socket.emit('send-chat-message', message);
    setProperty('userChatMessage', '');
  }

  renderChatBox(msg) {
    return (
      <div className="send-message">
        <input
          className="enter-message"
          type="text"
          placeholder="Send message..."
          value={msg}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleValueChange.bind(this, 'userChatMessage')} />
        <button className="submit-message" onClick={this.sendChat}>
          <i className="material-icons">send</i>
        </button>
      </div>
    );
  }

  renderChatLineItem(item, i) {
    const chatClass = classnames('message', {
      'message-chat': item.type === 'message',
      'message-nomination': item.type === 'nomination',
      'message-winning-bid': item.type === 'win',
      'message-bid': item.type === 'bid',
      'message-border': item.type === 'nomination' || item.type === 'bid'
    });
    moment.updateLocale('en', {
        relativeTime : {
            future: '0m',
            past:   '%s',
            s:  '0m',
            m:  '1m',
            mm: '%dm',
            h:  '1h',
            hh: '%dh',
            d:  '1d',
            dd: '%dd',
            M:  '1mo',
            MM: '%dmo',
            y:  '1y',
            yy: '%dy'
        }
    });
    const timestamp = moment(item.sent).fromNow();
    let timestampClass = 'timestamp';
    if (timestamp === '0m') timestampClass += ' invisible';
    return (
      <div key={i} className={chatClass}>
        { item.type === 'message' ?
          <span className="content-wrapper">
            <span className="author">{item.username ? item.username : ''}</span>
            <span className="content">{item.message}</span>
          </span>
          :
          <span className="content-wrapper">
            <span className="content">{item.username ? item.username : ''} {item.message}</span>
          </span>
        }
        <span className={timestampClass}>{moment(item.sent).fromNow()}</span>
      </div>
    );
  }

  render() {
    const { stream } = this.props;
    const { userChatMessage } = this.props;
    const localStorage = window.localStorage || localStorage;
    const isLoggedIn = localStorage.getItem('drafterUserId');
    const isCaptain = localStorage.getItem('drafterUserIsCaptain') === "true";
    const isAdmin = localStorage.getItem('drafterUserIsAdmin') === "true";
    const canChat = isLoggedIn && (isCaptain || isAdmin);
    return (
      <div className="chat">
        {canChat ? this.renderChatBox(userChatMessage) : null}
        <div className="messages">
          {stream.slice(0,100).map(this.renderChatLineItem)}
        </div>
      </div>
    );
  }
}

export default DraftChat;
