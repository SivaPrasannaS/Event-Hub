import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginAsync, logout, registerAsync } from '../auth/authSlice';
import rsvpAPI from './rsvpAPI';

export const fetchRsvpAsync = createAsyncThunk('rsvp/fetch', async (eventId, thunkAPI) => {
  try {
    const response = await rsvpAPI.get(eventId);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({
      message: error.response?.data?.message || 'Unable to fetch RSVP',
      status: error.response?.status,
      eventId,
    });
  }
});

export const saveRsvpAsync = createAsyncThunk('rsvp/save', async ({ eventId, payload }, thunkAPI) => {
  try {
    const response = await rsvpAPI.save(eventId, payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to save RSVP');
  }
});

export const deleteRsvpAsync = createAsyncThunk('rsvp/delete', async (eventId, thunkAPI) => {
  try {
    await rsvpAPI.remove(eventId);
    return eventId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to delete RSVP');
  }
});

const rsvpSlice = createSlice({
  name: 'rsvp',
  initialState: { rsvps: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, (state) => {
        state.rsvps = {};
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state) => {
        state.rsvps = {};
        state.loading = false;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.rsvps = {};
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchRsvpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvps[action.payload.eventId] = action.payload;
      })
      .addCase(fetchRsvpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Unable to fetch RSVP';
        if (action.payload?.status === 404) {
          delete state.rsvps[action.meta.arg];
        }
      })
      .addCase(saveRsvpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.rsvps[action.payload.eventId] = action.payload;
      })
      .addCase(deleteRsvpAsync.fulfilled, (state, action) => {
        state.loading = false;
        delete state.rsvps[action.payload];
      })
      .addMatcher((action) => action.type.startsWith('rsvp/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('rsvp/') && action.type.endsWith('/rejected') && action.type !== fetchRsvpAsync.rejected.type, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Request failed';
      });
  },
});

export default rsvpSlice.reducer;
