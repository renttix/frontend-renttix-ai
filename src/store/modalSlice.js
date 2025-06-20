import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    modelOpen: false,
    modalData: null,
  },
  reducers: {
    openModal: (state, action) => {
      state.modelOpen = true;
      state.modalData = action.payload;
    },
    closeModal: (state) => {
      state.modelOpen = false;
      state.modalData = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
