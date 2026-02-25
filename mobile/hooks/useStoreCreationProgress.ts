import { useReducer, useCallback, useMemo } from 'react';
import {
  type StoreCreationStep,
  STEP_LABELS,
  mapErrorToUserMessage,
} from '@/lib/errors/store-creation';

interface ProgressState {
  step: StoreCreationStep;
  rawError: unknown | null;
}

type ProgressAction =
  | { type: 'SET_STEP'; step: StoreCreationStep }
  | { type: 'SET_ERROR'; error: unknown; step: StoreCreationStep }
  | { type: 'RESET' };

const initialState: ProgressState = {
  step: 'idle',
  rawError: null,
};

function reducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, rawError: null };
    case 'SET_ERROR':
      return { step: action.step, rawError: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export interface UseStoreCreationProgressResult {
  step: StoreCreationStep;
  label: string;
  error: string | null;
  isInProgress: boolean;
  setStep: (step: StoreCreationStep) => void;
  setError: (error: unknown, step: StoreCreationStep) => void;
  reset: () => void;
}

export function useStoreCreationProgress(): UseStoreCreationProgressResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setStep = useCallback((step: StoreCreationStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const setError = useCallback((error: unknown, step: StoreCreationStep) => {
    dispatch({ type: 'SET_ERROR', error, step });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const label = useMemo(() => {
    if (state.step === 'idle' || state.step === 'error') return '';
    return STEP_LABELS[state.step];
  }, [state.step]);

  const error = useMemo(() => {
    if (!state.rawError) return null;
    return mapErrorToUserMessage(state.rawError, state.step);
  }, [state.rawError, state.step]);

  const isInProgress = state.step !== 'idle' && state.step !== 'error' && state.step !== 'complete';

  return {
    step: state.step,
    label,
    error,
    isInProgress,
    setStep,
    setError,
    reset,
  };
}
