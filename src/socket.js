import { loadDraft } from './redux/modules/edit';

import { receiveChatMessage, playerNominated } from './redux/modules/run';

function initializeListeners(socket, { dispatch }) {
  socket.on('admin-update', (id) => {
    dispatch(loadDraft(id));
  });

  socket.on('receive-chat-message', (message) => {
    dispatch(receiveChatMessage(message));
  });
  
  socket.on('nomination', (nomination) => {
    const { playerName, teamName, coins } = nomination;
    dispatch(playerNominated(nomination));
    dispatch(receiveChatMessage({
      type: 'nomination',
      sent: new Date(),
      username: teamName,
      message: `nominates ${playerName} with an initial bid of ${coins}`
    }));
  });

  socket.on('bid', (data) => {
    console.log('data', data);
  });

  socket.on('win', (data) => {
    console.log('data', data);
  });
}

export default initializeListeners;
