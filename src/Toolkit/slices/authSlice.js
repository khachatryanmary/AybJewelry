import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Register User
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ username, email, password }, thunkAPI) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, {
                username,
                email,
                password,
            });
            return data;
        } catch (err) {
            const message =
                err.response?.data?.message || "Registration failed. Please try again.";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login User
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ usernameOrEmail, password }, thunkAPI) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, {
                usernameOrEmail,
                password,
            });
            localStorage.setItem("loggedInUser", JSON.stringify(data));
            return data;
        } catch (err) {
            const message =
                err.response?.data?.message || "Login failed. Please try again.";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async ({ email, lng }, thunkAPI) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/forgot-password`, {
                email,
                lng,
            });
            return data;
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to send reset link. Please try again.";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: JSON.parse(localStorage.getItem("loggedInUser")) || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.error = null;
            localStorage.removeItem("loggedInUser");
        },
        setUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("loggedInUser", JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;