import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface ChainReattemptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedChainCount: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChainReattemptDialog({
  open,
  onOpenChange,
  failedChainCount,
  isLoading,
  onConfirm,
  onCancel,
}: ChainReattemptDialogProps) {
  const chainWord = failedChainCount === 1 ? 'chain' : 'chains';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Retry failed deployments?</DialogTitle>
          <DialogDescription>
            {failedChainCount} {chainWord} failed to deploy. Would you like to retry deploying to{' '}
            {failedChainCount === 1 ? 'this chain' : 'these chains'}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3">
          <Button variant="outline" onPress={onCancel} disabled={isLoading} className="flex-1">
            <Text>Cancel</Text>
          </Button>
          <Button onPress={onConfirm} disabled={isLoading} className="flex-1">
            <Text>{isLoading ? 'Retrying...' : 'Retry'}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
