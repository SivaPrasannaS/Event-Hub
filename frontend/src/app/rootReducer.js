import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import venuesReducer from '../features/venues/venuesSlice';
import mediaReducer from '../features/media/mediaSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import usersReducer from '../features/users/usersSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import rsvpReducer from '../features/rsvp/rsvpSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  events: eventsReducer,
  venues: venuesReducer,
  media: mediaReducer,
  categories: categoriesReducer,
  users: usersReducer,
  analytics: analyticsReducer,
  rsvp: rsvpReducer,
});

export default rootReducer;
