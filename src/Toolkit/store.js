import {configureStore} from "@reduxjs/toolkit";
import usersReducer from './slices/usersSlice.js'
import authReducer from './slices/authSlice.js'
import cartReducer from "./slices/cartSlice.js";
import wishlistReducer from './slices/wishlistSlice.js';

export const store = configureStore({
    reducer:{
        auth: authReducer,
        users: usersReducer,
        cart: cartReducer,
        wishlist: wishlistReducer
    }
})