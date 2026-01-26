import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProposalType = {
  currentItems: any[];
};

const initialState: ProposalType = {
  currentItems: [],
};

const paginationSlice = createSlice({
  name: "addCurrentItems",
  initialState,
  reducers: {
    setCurrentItem: (state, action: PayloadAction<any[]>) => {
      state.currentItems = action.payload;
    },
  },
});

export const { setCurrentItem } = paginationSlice.actions;

export default paginationSlice.reducer;
