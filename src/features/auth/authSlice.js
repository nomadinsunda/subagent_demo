import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isInitialized: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
    },
    setInitialized(state) {
      state.isInitialized = true
    },
    logout(state) {
      state.user = null
    },
  },
})

export const { setUser, setInitialized, logout } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsInitialized = (state) => state.auth.isInitialized
export const selectIsLoggedIn = (state) => !!state.auth.user
