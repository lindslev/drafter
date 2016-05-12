import { loadDraft } from './redux/modules/edit';

import { receiveChatMessage } from './redux/modules/run';

function initializeListeners(socket, { dispatch }) {
  socket.on('admin-update', (id) => {
    dispatch(loadDraft(id));
  });

  socket.on('receive-chat-message', (message) => {
    dispatch(receiveChatMessage(message));
  });
}

export default initializeListeners;
