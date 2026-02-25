import { useReducer, useCallback, useMemo } from 'react';
import type { StoreAddress } from '@/types/juicebox';

export const NAME_MAX_LENGTH = 50;
export const TICKER_MAX_LENGTH = 5;
export const DESCRIPTION_MAX_LENGTH = 200;

const NAME_PATTERN = /^[A-Za-z0-9 '\-&.]*$/;
const TICKER_PATTERN = /^[A-Z0-9]*$/;

const RESERVED_TICKERS = [
  'USD',
  'USDC',
  'USDT',
  'ETH',
  'BTC',
  'SOL',
  'DAI',
  'BUSD',
  'WETH',
  'WBTC',
  'MATIC',
  'BNB',
  'XRP',
  'ADA',
  'DOGE',
  'AVAX',
  'DOT',
  'LINK',
];

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

type TouchedFields = Partial<Record<keyof StoreCreationFormState, boolean>>;

export type ValidationErrors = Partial<Record<keyof StoreCreationFormState, string>>;

type StoreCreationFormAction =
  | { type: 'UPDATE_FIELD'; field: keyof StoreCreationFormState; value: unknown }
  | { type: 'TOUCH_FIELD'; field: keyof StoreCreationFormState }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

interface FormReducerState {
  form: StoreCreationFormState;
  touched: TouchedFields;
}

const initialFormState: StoreCreationFormState = {
  step: 1,
  name: '',
  description: '',
  logoUri: null,
  address: null,
  website: '',
  ticker: '',
  cashBack: 5,
};

const initialState: FormReducerState = {
  form: initialFormState,
  touched: {},
};

function reducer(state: FormReducerState, action: StoreCreationFormAction): FormReducerState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
      };
    case 'TOUCH_FIELD':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'NEXT_STEP':
      return state.form.step === 1
        ? { ...state, form: { ...state.form, step: 2 }, touched: {} }
        : state;
    case 'PREV_STEP':
      return state.form.step === 2
        ? { ...state, form: { ...state.form, step: 1 }, touched: {} }
        : state;
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function sanitizeWebsiteInput(input: string): string {
  let sanitized = input.trim();
  sanitized = sanitized.replace(/^https?:\/\//i, '');
  sanitized = sanitized.replace(/^www\./i, '');
  return sanitized;
}

function isValidWebsiteUrl(urlString: string): boolean {
  if (!urlString) return true;
  try {
    const url = new URL(`https://${urlString}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Store name is required';
  }
  if (!NAME_PATTERN.test(name)) {
    return "Name can only contain letters, numbers, spaces, and ' - & .";
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `Name must be ${NAME_MAX_LENGTH} characters or less`;
  }
  return undefined;
}

function validateTicker(ticker: string): string | undefined {
  const symbol = ticker.replace(/^\$/, '').toUpperCase();
  if (!symbol) {
    return 'Ticker is required';
  }
  if (!TICKER_PATTERN.test(symbol)) {
    return 'Ticker can only contain letters and numbers';
  }
  if (symbol.length > TICKER_MAX_LENGTH) {
    return `Ticker must be ${TICKER_MAX_LENGTH} characters or less`;
  }
  if (RESERVED_TICKERS.includes(symbol)) {
    return 'This ticker is reserved for common cryptocurrencies';
  }
  return undefined;
}

function validateWebsite(website: string): string | undefined {
  if (!website) return undefined;
  if (!isValidWebsiteUrl(website)) {
    return 'Please enter a valid website URL';
  }
  return undefined;
}

function validateStep1(form: StoreCreationFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const websiteError = validateWebsite(form.website);
  if (websiteError) errors.website = websiteError;

  return errors;
}

function validateStep2(form: StoreCreationFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  const tickerError = validateTicker(form.ticker);
  if (tickerError) errors.ticker = tickerError;

  if (form.cashBack < 0 || form.cashBack > 10) {
    errors.cashBack = 'Cash back must be between 0% and 10%';
  }

  return errors;
}

function filterErrorsByTouched(errors: ValidationErrors, touched: TouchedFields): ValidationErrors {
  const filtered: ValidationErrors = {};
  for (const [field, error] of Object.entries(errors)) {
    if (touched[field as keyof StoreCreationFormState]) {
      filtered[field as keyof StoreCreationFormState] = error;
    }
  }
  return filtered;
}

export interface UseStoreCreationFormResult {
  state: StoreCreationFormState;
  step: 1 | 2;
  touched: TouchedFields;
  updateField: <K extends keyof StoreCreationFormState>(
    field: K,
    value: StoreCreationFormState[K]
  ) => void;
  markTouched: (field: keyof StoreCreationFormState) => void;
  clearTouched: (field: keyof StoreCreationFormState) => void;
  errors: ValidationErrors;
  visibleErrors: ValidationErrors;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  goToNextStep: () => boolean;
  goToPrevStep: () => void;
  reset: () => void;
  sanitizeWebsite: (input: string) => string;
}

export function useStoreCreationForm(): UseStoreCreationFormResult {
  const [{ form, touched }, dispatch] = useReducer(reducer, initialState);

  const updateField = useCallback(
    <K extends keyof StoreCreationFormState>(field: K, value: StoreCreationFormState[K]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  const markTouched = useCallback((field: keyof StoreCreationFormState) => {
    dispatch({ type: 'TOUCH_FIELD', field });
  }, []);

  const clearTouched = useCallback(
    (field: keyof StoreCreationFormState) => {
      if (touched[field]) {
        dispatch({ type: 'UPDATE_FIELD', field, value: form[field] });
      }
    },
    [touched, form]
  );

  const step1Errors = useMemo(() => validateStep1(form), [form]);
  const step2Errors = useMemo(() => validateStep2(form), [form]);

  const errors = useMemo(() => {
    return form.step === 1 ? step1Errors : step2Errors;
  }, [form.step, step1Errors, step2Errors]);

  const visibleErrors = useMemo(() => {
    return filterErrorsByTouched(errors, touched);
  }, [errors, touched]);

  const isStep1Valid = useMemo(() => Object.keys(step1Errors).length === 0, [step1Errors]);
  const isStep2Valid = useMemo(() => Object.keys(step2Errors).length === 0, [step2Errors]);

  const goToNextStep = useCallback((): boolean => {
    if (form.step === 1 && isStep1Valid) {
      dispatch({ type: 'NEXT_STEP' });
      return true;
    }
    return false;
  }, [form.step, isStep1Valid]);

  const goToPrevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state: form,
    step: form.step,
    touched,
    updateField,
    markTouched,
    clearTouched,
    errors,
    visibleErrors,
    isStep1Valid,
    isStep2Valid,
    goToNextStep,
    goToPrevStep,
    reset,
    sanitizeWebsite: sanitizeWebsiteInput,
  };
}
