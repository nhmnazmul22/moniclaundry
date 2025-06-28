import api from "@/lib/config/axios";
import { User } from "@/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  items?: User;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: {
    _id: "",
    email: "",
    phone: "",
    full_name: "",
    role: "owner",
    is_active: true,
  },
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk<User, string>(
  "users/fetchByEmail",
  async (email: string) => {
    const response = await api.get(`/api/users/${email}`);
    return response.data.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export default userSlice.reducer;
