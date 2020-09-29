import { combineReducers } from 'redux';
import pointReducer from './pointReducer';
import distanceReducer from './distanceReducer';

export default combineReducers({
	pointReducer,
	distanceReducer,
});
