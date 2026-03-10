import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    loading: false,
    error: null
  },
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setBookings, setLoading, setError } = bookingSlice.actions;
export default bookingSlice.reducer;