import {configureStore} from "@reduxjs/toolkit";
import usersReducer from './slices/usersSlice.js'
import authReducer from './slices/authSlice.js'
export const store = configureStore({
    reducer:{
        auth: authReducer,
        users: usersReducer
    }
})