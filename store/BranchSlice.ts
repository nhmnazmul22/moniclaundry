import api from "@/lib/config/axios";
import { Branches } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Branches[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBranches = createAsyncThunk<Branches[]>(
  "branches/fetchBranches",
  async () => {
    const response = await api.get(`/api/branches`);
    return response.data.data;
  }
);

const branchSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBranches.fulfilled,
        (state, action: PayloadAction<Branches[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default branchSlice.reducer;
