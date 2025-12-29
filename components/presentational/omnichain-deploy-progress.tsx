import { View } from 'react-native';
import { Check, Loader2, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { OMNICHAIN_CHAIN_IDS, type OmnichainChainId } from '@/lib/juicebox/constants';
import { getChainName } from '@/lib/juicebox/revnet';
import type { OmnichainDeployResult } from '@/types/revnet';

interface OmnichainDeployProgressProps {
  chainResults: Map<OmnichainChainId, OmnichainDeployResult>;
  isUploading?: boolean;
  className?: string;
}

function getStatusIcon(status: OmnichainDeployResult['status'] | 'waiting') {
  switch (status) {
    case 'success':
      return <Check size={16} className="text-primary" />;
    case 'error':
      return <AlertCircle size={16} className="text-destructive" />;
    case 'pending':
      return <Loader2 size={16} className="animate-spin text-muted-foreground" />;
    default:
      return <View className="h-4 w-4 rounded-full border border-muted-foreground/30" />;
  }
}

function ChainDeployStatus({
  chainId,
  result,
}: {
  chainId: OmnichainChainId;
  result?: OmnichainDeployResult;
}) {
  const status = result?.status ?? 'waiting';
  const chainName = getChainName(chainId);

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center gap-3">
        {getStatusIcon(status)}
        <Text
          className={cn(
            'text-sm',
            status === 'success' && 'text-primary',
            status === 'error' && 'text-destructive',
            status === 'pending' && 'text-foreground',
            status === 'waiting' && 'text-muted-foreground'
          )}>
          {chainName}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground">
        {status === 'success' && 'Complete'}
        {status === 'error' && 'Failed'}
        {status === 'pending' && 'Deploying...'}
        {status === 'waiting' && 'Waiting'}
      </Text>
    </View>
  );
}

export function OmnichainDeployProgress({
  chainResults,
  isUploading,
  className,
}: OmnichainDeployProgressProps) {
  const successCount = Array.from(chainResults.values()).filter(
    (r) => r.status === 'success'
  ).length;
  const totalChains = OMNICHAIN_CHAIN_IDS.length;
  const progressPercent = isUploading ? 5 : Math.round((successCount / totalChains) * 95) + 5;

  return (
    <Animated.View entering={FadeIn.duration(200)} className={cn('gap-4', className)}>
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">
            {isUploading ? 'Preparing metadata...' : 'Deploying across chains...'}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {successCount}/{totalChains}
          </Text>
        </View>
        <Progress value={progressPercent} className="h-2" />
      </View>

      <View className="rounded-lg border border-border bg-muted/30 px-4">
        {OMNICHAIN_CHAIN_IDS.map((chainId) => (
          <ChainDeployStatus key={chainId} chainId={chainId} result={chainResults.get(chainId)} />
        ))}
      </View>
    </Animated.View>
  );
}
