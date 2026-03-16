import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import analyticsAPI from './analyticsAPI';

export const fetchAnalyticsSummaryAsync = createAsyncThunk('analytics/summary', async (_, thunkAPI) => {
  try {
    const [summary, monthly, byCategory] = await Promise.all([
      analyticsAPI.summary(),
      analyticsAPI.monthly(),
      analyticsAPI.byCategory(),
    ]);
    return {
      summary: summary.data,
      monthly: monthly.data,
      byCategory: byCategory.data,
    };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Unable to fetch analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { summary: null, monthly: [], byCategory: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummaryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsSummaryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.monthly = action.payload.monthly;
        state.byCategory = action.payload.byCategory;
      })
      .addCase(fetchAnalyticsSummaryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
