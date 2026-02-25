export type CurrencyDisplayConfig = {
  enableCompactNotation: boolean;
  toFixed: number;
  compactToFixed: number;
};

function formatFullValue(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompactValue(value: number, decimals: number): string {
  const formatted = value.toLocaleString('en-US', {
    notation: 'compact',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `$${formatted}`;
}

export function shouldUseCompactNotation(value: number, maxCharacters: number): boolean {
  const fullFormatted = formatFullValue(value);
  return fullFormatted.length > maxCharacters;
}

export function getCurrencyDisplayConfig(
  value: number,
  maxCharacters: number
): CurrencyDisplayConfig {
  const needsCompact = shouldUseCompactNotation(value, maxCharacters);

  return {
    enableCompactNotation: needsCompact,
    toFixed: 2,
    compactToFixed: 2,
  };
}

export function getFormattedCurrencyPreview(value: number, maxCharacters: number): string {
  const needsCompact = shouldUseCompactNotation(value, maxCharacters);

  if (needsCompact) {
    return formatCompactValue(value, 2);
  }

  return formatFullValue(value);
}

export const CHARACTER_LIMITS = {
  HOME_BALANCE: 8,
  TOKEN_DETAIL: 14,
  STORE_BALANCE: 10,
  STORE_VALUE: 8,
} as const;

export function formatTokenAmount(value: number, maxCharacters: number): string {
  const fullFormatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (fullFormatted.length > maxCharacters) {
    return value.toLocaleString('en-US', {
      notation: 'compact',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return fullFormatted;
}
