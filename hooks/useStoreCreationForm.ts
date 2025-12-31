import { useReducer, useCallback, useMemo } from 'react';
import type { StoreAddress } from '@/types/juicebox';

export const NAME_MAX_LENGTH = 50;
export const TICKER_MAX_LENGTH = 5;

export interface StoreCreationFormState {
  step: 1 | 2;
  name: string;
  description: string;
  logoUri: string | null;
  address: StoreAddress | null;
  website: string;
  ticker: string;
  cashBack: number;
}

export type ValidationErrors = Partial<Record<keyof StoreCreationFormState, string>>;

type StoreCreationFormAction =
  | { type: 'UPDATE_FIELD'; field: keyof StoreCreationFormState; value: unknown }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

const initialState: StoreCreationFormState = {
  step: 1,
  name: '',
  description: '',
  logoUri: null,
  address: null,
  website: '',
  ticker: '',
  cashBack: 5,
};

function reducer(
  state: StoreCreationFormState,
  action: StoreCreationFormAction
): StoreCreationFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'NEXT_STEP':
      return state.step === 1 ? { ...state, step: 2 } : state;
    case 'PREV_STEP':
      return state.step === 2 ? { ...state, step: 1 } : state;
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function isValidUrl(urlString: string): boolean {
  if (!urlString) return true;
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateStep1(state: StoreCreationFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!state.name.trim()) {
    errors.name = 'Name is required';
  } else if (state.name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or less`;
  }

  if (!state.logoUri) {
    errors.logoUri = 'Logo is required';
  }

  if (!state.description.trim()) {
    errors.description = 'Description is required';
  }

  if (state.website && !isValidUrl(state.website)) {
    errors.website = 'Please enter a valid URL';
  }

  return errors;
}

function validateStep2(state: StoreCreationFormState): ValidationErrors {
  const errors: ValidationErrors = {};
  const tickerSymbol = state.ticker.replace(/^\$/, '');

  if (!tickerSymbol) {
    errors.ticker = 'Ticker is required';
  } else if (tickerSymbol.length > TICKER_MAX_LENGTH) {
    errors.ticker = `Ticker must be ${TICKER_MAX_LENGTH} characters or less`;
  }

  if (state.cashBack < 0 || state.cashBack > 10) {
    errors.cashBack = 'Cash back must be between 0% and 10%';
  }

  return errors;
}

export interface UseStoreCreationFormResult {
  state: StoreCreationFormState;
  step: 1 | 2;
  dispatch: React.Dispatch<StoreCreationFormAction>;
  updateField: <K extends keyof StoreCreationFormState>(
    field: K,
    value: StoreCreationFormState[K]
  ) => void;
  errors: ValidationErrors;
  validateCurrentStep: () => boolean;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  goToNextStep: () => boolean;
  goToPrevStep: () => void;
  reset: () => void;
}

export function useStoreCreationForm(): UseStoreCreationFormResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateField = useCallback(
    <K extends keyof StoreCreationFormState>(field: K, value: StoreCreationFormState[K]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  const step1Errors = useMemo(() => validateStep1(state), [state]);
  const step2Errors = useMemo(() => validateStep2(state), [state]);

  const errors = useMemo(() => {
    return state.step === 1 ? step1Errors : step2Errors;
  }, [state.step, step1Errors, step2Errors]);

  const isStep1Valid = useMemo(() => Object.keys(step1Errors).length === 0, [step1Errors]);
  const isStep2Valid = useMemo(() => Object.keys(step2Errors).length === 0, [step2Errors]);

  const validateCurrentStep = useCallback((): boolean => {
    if (state.step === 1) {
      return isStep1Valid;
    }
    return isStep2Valid;
  }, [state.step, isStep1Valid, isStep2Valid]);

  const goToNextStep = useCallback((): boolean => {
    if (state.step === 1 && isStep1Valid) {
      dispatch({ type: 'NEXT_STEP' });
      return true;
    }
    return false;
  }, [state.step, isStep1Valid]);

  const goToPrevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    step: state.step,
    dispatch,
    updateField,
    errors,
    validateCurrentStep,
    isStep1Valid,
    isStep2Valid,
    goToNextStep,
    goToPrevStep,
    reset,
  };
}
