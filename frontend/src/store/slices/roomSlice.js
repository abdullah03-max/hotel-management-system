import { createSlice } from '@reduxjs/toolkit';

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    availableRooms: [],
    loading: false,
    error: null
  },
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setAvailableRooms: (state, action) => {
      state.availableRooms = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setRooms, setAvailableRooms, setLoading, setError } = roomSlice.actions;
export default roomSlice.reducer;