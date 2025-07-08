import api from "@/lib/config/axios";
import { NotificationType } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  items?: NotificationType[];
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNotification = createAsyncThunk<NotificationType[], string>(
  "notification/fetchNotification",
  async (branchId) => {
    const response = await api.get(`/api/notification?branch_id=${branchId}`);
    return response.data.data;
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(
        fetchNotification.fulfilled,
        (state, action: PayloadAction<NotificationType[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchNotification.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default notificationSlice.reducer;
