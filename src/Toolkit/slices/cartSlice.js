import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.cart = action.payload.map(item => ({
                ...item,
                totalPrice: item.price * item.quantity
            }));
        },
        addToCart: (state, action) => {
            const item = action.payload;
            const existing = state.cart.find((i) => i.id === item.id && i.size === item.size);
            if (existing) {
                existing.quantity += item.quantity;
                existing.totalPrice = existing.quantity * existing.price;
            } else {
                state.cart.push({
                    ...item,
                    totalPrice: item.price * item.quantity,
                });
            }
        },
        removeFromCart: (state, action) => {
            const { id, size } = action.payload;
            state.cart = state.cart.filter((item) => !(item.id === id && item.size === size));
        },
        clearCart: (state) => {
            state.cart = [];
        },
        increaseQuantity: (state, action) => {
            const { id, size } = action.payload;
            const item = state.cart.find(i => i.id === id && i.size === size);
            if (item) {
                item.quantity += 1;
                item.totalPrice = item.quantity * item.price;
            }
        },
        decreaseQuantity: (state, action) => {
            const { id, size } = action.payload;
            const item = state.cart.find(i => i.id === id && i.size === size);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                item.totalPrice = item.quantity * item.price;
            }
        },
    },
});

export default cartSlice.reducer;

export const selectCartTotal = (state) =>
    state.cart.cart.reduce((total, item) => total + item.totalPrice, 0);

export const {
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity
} = cartSlice.actions;