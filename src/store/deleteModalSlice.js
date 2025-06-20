import { createSlice } from "@reduxjs/toolkit";

const deleteModalSlice = createSlice({
  name: "delete",
  initialState: {
    modelOpen: false,
    modalData: [{}],
    loadingModal: false, 
  },
  reducers: {
    openDeleteModal: (state, action) => {
      state.modelOpen = true;
      state.modalData = action.payload; // Set the dynamic data
      state.loadingModal = false; 
     
    },
    closeDeleteModal: (state) => {
      state.modelOpen = false;
      state.modalData = null; // Clear the data
      state.loadingModal = false; 
    },
    setLoadingModal: (state, action) => {
      state.loadingModal = action.payload; 
    },
  },
});

export const { openDeleteModal, closeDeleteModal,setLoadingModal } = deleteModalSlice.actions;
export default deleteModalSlice.reducer;
