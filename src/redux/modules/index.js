import { combineReducers } from 'redux';

import createDraft from './create';
import editDraft from './edit';
import runDraft from './run';
import user from './user';

export default combineReducers({
  createDraft,
  editDraft,
  runDraft,
  user
});
