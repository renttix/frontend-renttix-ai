import { createSlice } from '@reduxjs/toolkit';

const dirtySlice = createSlice({
  name: 'dirty',
  initialState: false,
  reducers: {
    setDirty: () => true,
    clearDirty: () => false
  }
});

export const { setDirty, clearDirty } = dirtySlice.actions;
export default dirtySlice.reducer;
