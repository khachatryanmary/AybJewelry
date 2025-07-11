import axios from "axios";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, thunkAPI) =>{
        try {
            const response = await axios.get('http://localhost:4000/users')
            console.log(response)
            return response.data
        }catch (err){
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
const usersSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        loading: false,
        errors: null
    },
    reducers: {},
    extraReducers: (builder)=>{
        builder
            .addCase(fetchUsers.pending, (state)  =>{
                state.loading = true
                state.errors = null
            })
            .addCase(fetchUsers.fulfilled, (state, action) =>{
                state.users = action.payload
                state.loading = false
            })
            .addCase(fetchUsers.rejected, (state, action) =>{
                state.loading = false
                state.errors = action.payload
            })

    }

})


export default usersSlice.reducer