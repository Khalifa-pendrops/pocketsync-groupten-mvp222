import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ApiUser, OnboardingStep } from '../../api/types';

interface AuthState {
  isAuthenticated: boolean;
  user: ApiUser | null;
  sessionChecked: boolean;
  onboardingComplete: boolean | null;
  onboardingStep: OnboardingStep | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  sessionChecked: false,
  onboardingComplete: null,
  onboardingStep: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<ApiUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setOnboardingStatus: (
      state,
      action: PayloadAction<{ onboardingComplete: boolean; currentStep: OnboardingStep }>,
    ) => {
      state.onboardingComplete = action.payload.onboardingComplete;
      state.onboardingStep = action.payload.currentStep;
    },
    setSessionChecked: (state) => {
      state.sessionChecked = true;
    },
    clearSession: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.onboardingComplete = null;
      state.onboardingStep = null;
    },
  },
});

export const { setUser, setOnboardingStatus, setSessionChecked, clearSession } = authSlice.actions;

export default authSlice.reducer;