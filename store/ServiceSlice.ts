import api from "@/lib/config/axios";
import { Service } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk<Service[], string>(
  "service/fetchServices",
  async (branchId) => {
    const response = await api.get(`/api/services?branch_id=${branchId}`);
    return response.data.data;
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchServices.fulfilled,
        (state, action: PayloadAction<Service[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
        state.items = [];
      });
  },
});

export default servicesSlice.reducer;
