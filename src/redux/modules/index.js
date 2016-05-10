import { combineReducers } from 'redux';

import createDraft from './create';
import editDraft from './edit';
import runDraft from './run';

export default combineReducers({
  createDraft,
  editDraft,
  runDraft
});
