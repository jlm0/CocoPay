import { useState, useMemo, useCallback } from 'react';

export interface UseAmountInputLogicOptions {
  initialAmount?: string;
  balance: number;
  isFromExternal?: boolean;
  onReset?: () => void;
}

export interface UseAmountInputLogicResult {
  amountRaw: string;
  setAmountRaw: (amount: string) => void;
  displayAmount: string;
  numericAmount: number;
  amountExceedsBalance: boolean;
  isValidAmount: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleAmountChange: (newAmount: string) => void;
  reset: () => void;
}

export function useAmountInputLogic({
  initialAmount,
  balance,
  isFromExternal = false,
  onReset,
}: UseAmountInputLogicOptions): UseAmountInputLogicResult {
  const [amountRaw, setAmountRaw] = useState(initialAmount ?? '');
  const [isEditing, setIsEditing] = useState(!initialAmount);

  const displayAmount = amountRaw ? `$${amountRaw}` : '';

  const numericAmount = useMemo(() => {
    return parseFloat(amountRaw) || 0;
  }, [amountRaw]);

  const amountExceedsBalance = numericAmount > balance;
  const isValidAmount = numericAmount > 0 && !amountExceedsBalance;

  const handleAmountChange = useCallback(
    (newAmount: string) => {
      const cleaned = newAmount.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
      setAmountRaw(sanitized);
      onReset?.();
    },
    [onReset]
  );

  const reset = useCallback(() => {
    setAmountRaw(initialAmount ?? '');
    setIsEditing(!initialAmount);
    onReset?.();
  }, [initialAmount, onReset]);

  const isAmountReadonly = isFromExternal && !!initialAmount && !isEditing;

  return {
    amountRaw,
    setAmountRaw,
    displayAmount,
    numericAmount,
    amountExceedsBalance,
    isValidAmount,
    isEditing: !isAmountReadonly,
    setIsEditing,
    handleAmountChange,
    reset,
  };
}
