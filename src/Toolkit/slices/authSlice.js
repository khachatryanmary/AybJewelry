import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Register user
export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ username, email, password }, thunkAPI) => {
        try {
            const { data: users } = await axios.get("http://localhost:4000/users");

            const exists = users.find(
                (u) => u.email === email || u.username === username
            );
            if (exists) {
                return thunkAPI.rejectWithValue("User already exists");
            }

            const newUser = { username, email, password };
            const { data } = await axios.post("http://localhost:4000/users", newUser);
            localStorage.setItem("loggedInUser", JSON.stringify(data));
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue("Registration failed");
        }
    }
);

// ✅ Login user
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ usernameOrEmail, password }, thunkAPI) => {
        try {
            const { data: users } = await axios.get("http://localhost:4000/users");

            const found = users.find(
                (u) =>
                    (u.email === usernameOrEmail || u.username === usernameOrEmail) &&
                    u.password === password
            );

            if (!found) {
                return thunkAPI.rejectWithValue("Invalid credentials");
            }

            // ✅ Հաջող login → պահենք loggedIn
            await axios.post("http://localhost:4000/loggedIn", found);

            localStorage.setItem("loggedInUser", JSON.stringify(found));
            return found;
        } catch (err) {
            return thunkAPI.rejectWithValue("Login failed");
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
            const user = state.user;

            // 🔴 ջնջենք loggedIn-ից
            if (user && user.id) {
                axios.delete(`http://localhost:4000/loggedIn/${user.id}`);
            }

            state.user = null;
            state.error = null;
            localStorage.removeItem("loggedInUser");
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    },
});



export const { logout } = authSlice.actions;
export default authSlice.reducer;
