import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { parseStoreCode } from '@/lib/juicebox/transforms';

export interface UseStoreInputLogicOptions {
  initialStoreCode?: string;
  isFromExternal?: boolean;
  onReset?: () => void;
}

export interface UseStoreInputLogicResult {
  storeCode: string;
  setStoreCode: (code: string) => void;
  debouncedStoreCode: string;
  parsedCode: { chainId: number; projectId: bigint } | null;
  storeCodeError: string | undefined;
  isDebouncing: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleStoreCodeChange: (code: string) => void;
  reset: () => void;
}

export function useStoreInputLogic({
  initialStoreCode,
  isFromExternal = false,
  onReset,
}: UseStoreInputLogicOptions = {}): UseStoreInputLogicResult {
  const [storeCode, setStoreCode] = useState(initialStoreCode ?? '');
  const [isEditing, setIsEditing] = useState(!initialStoreCode);

  const [debouncedStoreCode] = useDebounce(storeCode, 800);

  const parsedCode = useMemo(() => parseStoreCode(debouncedStoreCode), [debouncedStoreCode]);

  const isDebouncing = storeCode !== debouncedStoreCode;

  const storeCodeError = useMemo(() => {
    if (!storeCode) return undefined;
    if (isDebouncing) return undefined;
    if (!parsedCode) return 'Invalid store code format';
    return undefined;
  }, [storeCode, isDebouncing, parsedCode]);

  const handleStoreCodeChange = useCallback(
    (code: string) => {
      const cleaned = code.replace(/[^0-9]/g, '');
      setStoreCode(cleaned);
      onReset?.();
      if (storeCode && !isFromExternal) {
        setIsEditing(true);
      }
    },
    [storeCode, isFromExternal, onReset]
  );

  const reset = useCallback(() => {
    setStoreCode(initialStoreCode ?? '');
    setIsEditing(!initialStoreCode);
    onReset?.();
  }, [initialStoreCode, onReset]);

  return {
    storeCode,
    setStoreCode,
    debouncedStoreCode,
    parsedCode,
    storeCodeError,
    isDebouncing,
    isEditing,
    setIsEditing,
    handleStoreCodeChange,
    reset,
  };
}
