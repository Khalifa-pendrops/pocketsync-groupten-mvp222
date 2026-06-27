import type { AppDispatch } from '../store/store';
import { clearSession, setOnboardingStatus, setUser } from '../store/slices/authSlice';
import type { ApiUser } from '../api/types';
import { onboardingService } from '../services/onboardingService';
import { clearPersistedUser, persistUser } from '../utils/session';

export async function establishSession(
  user: ApiUser,
  dispatch: AppDispatch,
): Promise<boolean> {
  persistUser(user);
  dispatch(setUser(user));
  return syncOnboardingStatus(dispatch);
}

export async function syncOnboardingStatus(dispatch: AppDispatch): Promise<boolean> {
  try {
    const status = await onboardingService.getStatus();
    dispatch(
      setOnboardingStatus({
        onboardingComplete: status.onboardingComplete,
        currentStep: status.currentStep,
      }),
    );
    return status.onboardingComplete;
  } catch {
    dispatch(
      setOnboardingStatus({
        onboardingComplete: false,
        currentStep: 'bvn_entry',
      }),
    );
    return false;
  }
}

export function tearDownSession(dispatch: AppDispatch): void {
  clearPersistedUser();
  dispatch(clearSession());
}