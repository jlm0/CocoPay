export type StoreCreationStep =
  | 'idle'
  | 'uploading-logo'
  | 'uploading-metadata'
  | 'creating-store'
  | 'registering'
  | 'complete'
  | 'error';

type ActiveStep = Exclude<StoreCreationStep, 'idle' | 'error'>;

export const STEP_LABELS: Record<ActiveStep, string> = {
  'uploading-logo': 'Uploading your logo...',
  'uploading-metadata': 'Saving store details...',
  'creating-store': 'Creating your store...',
  registering: 'Finishing up...',
  complete: 'Done!',
};

export function mapErrorToUserMessage(error: unknown, step: StoreCreationStep): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout')
  ) {
    return 'Connection issue. Check your internet and try again.';
  }

  if (step === 'uploading-logo') {
    return "Couldn't save your logo. Please try again.";
  }

  if (step === 'uploading-metadata') {
    return "Couldn't save store details. Please try again.";
  }

  if (
    message.includes('rejected') ||
    message.includes('denied') ||
    message.includes('cancelled') ||
    message.includes('canceled')
  ) {
    return 'Store creation was cancelled.';
  }

  if (message.includes('timed out')) {
    return 'Transaction timed out. Please try again.';
  }

  if (message.includes('wallet') || message.includes('not connected')) {
    return 'Wallet connection issue. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}
