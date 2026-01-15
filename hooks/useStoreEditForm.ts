import { useReducer, useCallback, useMemo } from 'react';
import type { StoreAddress } from '@/types/juicebox';

export const NAME_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 200;

const NAME_PATTERN = /^[A-Za-z0-9 '\-&.]*$/;

export interface StoreEditFormState {
  name: string;
  description: string;
  logoUri: string | null;
  address: StoreAddress | null;
  website: string;
}

type TouchedFields = Partial<Record<keyof StoreEditFormState, boolean>>;

export type ValidationErrors = Partial<Record<keyof StoreEditFormState, string>>;

type StoreEditFormAction =
  | { type: 'UPDATE_FIELD'; field: keyof StoreEditFormState; value: unknown }
  | { type: 'TOUCH_FIELD'; field: keyof StoreEditFormState }
  | { type: 'SET_ALL'; values: StoreEditFormState }
  | { type: 'RESET' };

interface FormReducerState {
  form: StoreEditFormState;
  touched: TouchedFields;
  initial: StoreEditFormState;
}

const emptyFormState: StoreEditFormState = {
  name: '',
  description: '',
  logoUri: null,
  address: null,
  website: '',
};

function createInitialState(initialValues?: Partial<StoreEditFormState>): FormReducerState {
  const form: StoreEditFormState = {
    ...emptyFormState,
    ...initialValues,
  };
  return {
    form,
    touched: {},
    initial: form,
  };
}

function reducer(state: FormReducerState, action: StoreEditFormAction): FormReducerState {
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
    case 'SET_ALL':
      return {
        ...state,
        form: action.values,
        initial: action.values,
        touched: {},
      };
    case 'RESET':
      return {
        ...state,
        form: state.initial,
        touched: {},
      };
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

function validateWebsite(website: string): string | undefined {
  if (!website) return undefined;
  if (!isValidWebsiteUrl(website)) {
    return 'Please enter a valid website URL';
  }
  return undefined;
}

function validateForm(form: StoreEditFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const websiteError = validateWebsite(form.website);
  if (websiteError) errors.website = websiteError;

  return errors;
}

function filterErrorsByTouched(errors: ValidationErrors, touched: TouchedFields): ValidationErrors {
  const filtered: ValidationErrors = {};
  for (const [field, error] of Object.entries(errors)) {
    if (touched[field as keyof StoreEditFormState]) {
      filtered[field as keyof StoreEditFormState] = error;
    }
  }
  return filtered;
}

export interface UseStoreEditFormResult {
  state: StoreEditFormState;
  touched: TouchedFields;
  updateField: <K extends keyof StoreEditFormState>(field: K, value: StoreEditFormState[K]) => void;
  markTouched: (field: keyof StoreEditFormState) => void;
  errors: ValidationErrors;
  visibleErrors: ValidationErrors;
  isValid: boolean;
  hasChanges: boolean;
  setValues: (values: StoreEditFormState) => void;
  reset: () => void;
  sanitizeWebsite: (input: string) => string;
}

export function useStoreEditForm(
  initialValues?: Partial<StoreEditFormState>
): UseStoreEditFormResult {
  const [{ form, touched, initial }, dispatch] = useReducer(
    reducer,
    initialValues,
    createInitialState
  );

  const updateField = useCallback(
    <K extends keyof StoreEditFormState>(field: K, value: StoreEditFormState[K]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  const markTouched = useCallback((field: keyof StoreEditFormState) => {
    dispatch({ type: 'TOUCH_FIELD', field });
  }, []);

  const setValues = useCallback((values: StoreEditFormState) => {
    dispatch({ type: 'SET_ALL', values });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const errors = useMemo(() => validateForm(form), [form]);

  const visibleErrors = useMemo(() => {
    return filterErrorsByTouched(errors, touched);
  }, [errors, touched]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const hasChanges = useMemo(() => {
    return (
      form.name !== initial.name ||
      form.description !== initial.description ||
      form.logoUri !== initial.logoUri ||
      form.website !== initial.website ||
      JSON.stringify(form.address) !== JSON.stringify(initial.address)
    );
  }, [form, initial]);

  return {
    state: form,
    touched,
    updateField,
    markTouched,
    errors,
    visibleErrors,
    isValid,
    hasChanges,
    setValues,
    reset,
    sanitizeWebsite: sanitizeWebsiteInput,
  };
}
