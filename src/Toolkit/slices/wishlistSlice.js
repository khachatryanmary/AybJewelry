import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wishlist: []
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const item = action.payload;
            const exists = state.wishlist.some(i => i.id === item.id);
            if (!exists) {
                state.wishlist.push(item);
            }
        },
        removeFromWishlist: (state, action) => {
            const id = action.payload;
            const index = state.wishlist.findIndex(item => item.id === id);
            if (index !== -1) {
                state.wishlist.splice(index, 1);
            }
        },
        clearWishlist: (state) => {
            state.wishlist.length = 0; //
        }
    }
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
