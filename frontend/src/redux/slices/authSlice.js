import { createSlice } from "@reduxjs/toolkit";

// =====================================================
// LOAD SAVED AUTHENTICATION DATA
// =====================================================

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

let parsedUser = null;

try {
  parsedUser = savedUser ? JSON.parse(savedUser) : null;
} catch (error) {
  console.error("Failed to parse saved user:", error);
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  parsedUser = null;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  user: parsedUser,
  token: savedToken || null,

  isAuthenticated: Boolean(savedToken),

  isLoading: false,

  error: null,

  registrationSuccess: false,

  registeredUser: null,
};

// =====================================================
// AUTH SLICE
// =====================================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // =========================
    // REGISTER
    // =========================

    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.registrationSuccess = false;
    },

    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;

      state.registrationSuccess = true;

      state.registeredUser = action.payload;
    },

    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.registrationSuccess = false;
    },

    // =========================
    // LOGIN START
    // =========================

    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;

      // Clear the previous user's authentication data
      // before another account logs in.
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginType");
    },

    // =========================
    // LOGIN SUCCESS
    // =========================

    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.error = null;

      const response = action.payload;

      // Support responses with either a nested user object
      // or user details directly in the response.
      const userData = response.user ?? response;

      state.token = response.token ?? null;
      state.user = userData;

      state.isAuthenticated = Boolean(response.token);

      // Save the new user's authentication data.
      if (response.token) {
        localStorage.setItem("token", response.token);
      } else {
        localStorage.removeItem("token");
      }

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("user");
      }
    },

    // =========================
    // LOGIN FAILURE
    // =========================

    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginType");
    },

    // =========================
    // LOGOUT
    // =========================

    logout: (state) => {
      state.user = null;
      state.token = null;

      state.isAuthenticated = false;
      state.isLoading = false;

      state.error = null;

      state.registrationSuccess = false;
      state.registeredUser = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginType");
      localStorage.removeItem("isSeller");
    },

    // =========================
    // CLEAR ERROR
    // =========================

    clearAuthError: (state) => {
      state.error = null;
    },

    // =========================
    // CLEAR REGISTRATION
    // =========================

    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
      state.registeredUser = null;
    },
  },
});

// =====================================================
// EXPORT ACTIONS
// =====================================================

export const {
  registerStart,
  registerSuccess,
  registerFailure,

  loginStart,
  loginSuccess,
  loginFailure,

  logout,

  clearAuthError,
  clearRegistrationSuccess,
} = authSlice.actions;

// =====================================================
// EXPORT REDUCER
// =====================================================

export default authSlice.reducer;
