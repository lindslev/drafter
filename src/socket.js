import { loadDraft } from './redux/modules/edit';

import { receiveChatMessage, playerNominated, startTimer,
         bidMadeOnNomination } from './redux/modules/run';

function initializeListeners(socket, { dispatch }) {
  socket.on('admin-update', (id) => {
    dispatch(loadDraft(id));
  });

  socket.on('receive-chat-message', (message) => {
    dispatch(receiveChatMessage(message));
  });

  socket.on('nomination', (nomination) => {
    const { playerName, teamName, coins } = nomination;
    dispatch(startTimer('nomination'));
    dispatch(playerNominated(nomination));
    dispatch(receiveChatMessage({
      type: 'nomination',
      sent: new Date(),
      username: teamName,
      message: `nominates ${playerName} with an initial bid of ${coins}`
    }));
  });

  socket.on('bid', (bid) => {
    const { playerName, teamName, coins } = bid;
    dispatch(startTimer('bid'));
    dispatch(bidMadeOnNomination(bid));
    dispatch(receiveChatMessage({
      type: 'bid',
      sent: new Date(),
      username: teamName,
      message: `bids ${coins} on ${playerName}`
    }));
  });

  socket.on('win', (data) => {
    console.log('data', data);
  });
}

export default initializeListeners;
