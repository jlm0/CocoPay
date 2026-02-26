import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, ZoomIn } from 'react-native-reanimated';
import {
  CloudUpload,
  ShieldCheck,
  Wallet,
  Clock,
  CircleCheck,
  XCircle,
  Database,
  type LucideIcon,
} from 'lucide-react-native';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import type { CreationStage } from '@/components/containers/CreateStoreStatusContainer';

interface StoreCreationProgressProps {
  stage: CreationStage;
  storeName: string;
  storeId?: string;
  error?: Error;
  isFinalizingRetrying?: boolean;
  onRetry?: () => void;
  onViewStore?: () => void;
  onGoHome?: () => void;
}

interface StepConfig {
  id: CreationStage;
  label: string;
  icon: LucideIcon;
}

const STEPS: StepConfig[] = [
  { id: 'preparing', label: 'Preparing your store', icon: CloudUpload },
  { id: 'simulating', label: 'Checking setup', icon: ShieldCheck },
  { id: 'deploying', label: 'Setting up payments', icon: Wallet },
  { id: 'confirming', label: 'Finishing up', icon: Clock },
  { id: 'finalizing', label: 'Indexing store data', icon: Database },
];

function getStepStatus(
  stepId: CreationStage,
  currentStage: CreationStage
): 'pending' | 'active' | 'completed' {
  const stepIndex = STEPS.findIndex((s) => s.id === stepId);
  const currentIndex = STEPS.findIndex((s) => s.id === currentStage);

  if (currentStage === 'success' || currentStage === 'error') {
    if (currentStage === 'error' && stepIndex === currentIndex) {
      return 'active';
    }
    return stepIndex <= currentIndex ? 'completed' : 'pending';
  }

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

function StepItem({
  step,
  status,
  index,
  isError,
  showSpinner,
}: {
  step: StepConfig;
  status: 'pending' | 'active' | 'completed';
  index: number;
  isError: boolean;
  showSpinner?: boolean;
}) {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  const iconColor = isCompleted
    ? 'text-primary'
    : isActive
      ? isError
        ? 'text-destructive'
        : 'text-primary'
      : 'text-muted-foreground';

  const textColor = isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground';

  const StepIcon = isCompleted ? CircleCheck : isError && isActive ? XCircle : step.icon;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(300)}
      className="flex-row items-center gap-4 py-3">
      <View className="h-10 w-10 items-center justify-center bg-muted">
        <Icon as={StepIcon} size={20} className={iconColor} />
      </View>
      <Text className={`flex-1 text-base font-mono ${textColor}`}>{step.label}</Text>
      {isActive && !isError && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          {showSpinner ? <Spinner size="small" /> : <View className="h-2 w-2 bg-primary" />}
        </Animated.View>
      )}
    </Animated.View>
  );
}

function ProgressView({
  stage,
  storeName,
  error,
  isFinalizingRetrying,
}: {
  stage: CreationStage;
  storeName: string;
  error?: Error;
  isFinalizingRetrying?: boolean;
}) {
  const isError = stage === 'error';
  const isFinalizing = stage === 'finalizing';
  const currentStepIndex = STEPS.findIndex((s) => s.id === stage);
  const failedAtStep = isError && currentStepIndex >= 0 ? STEPS[currentStepIndex] : null;

  const getSubtitle = () => {
    if (isError) return 'We encountered an issue while creating your store';
    if (isFinalizing) return 'Waiting for your store to be indexed...';
    return `Setting up ${storeName}`;
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <Animated.View entering={FadeInUp.duration(400)} className="mb-8">
        <Text variant="title" className="text-center">
          {isError ? 'Something went wrong' : 'Creating your store'}
        </Text>
        <Text variant="caption" className="mt-2 text-center">
          {getSubtitle()}
        </Text>
      </Animated.View>

      <View className="bg-card p-4">
        {STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step.id, stage);
          const showStep = !isError || index <= (failedAtStep ? STEPS.indexOf(failedAtStep) : -1);
          if (!showStep) return null;

          return (
            <StepItem
              key={step.id}
              step={step}
              status={isError && step.id === failedAtStep?.id ? 'active' : stepStatus}
              index={index}
              isError={isError && step.id === failedAtStep?.id}
              showSpinner={step.id === 'finalizing' && isFinalizingRetrying}
            />
          );
        })}
      </View>

      {isError && error && (
        <Animated.View entering={FadeIn.delay(300).duration(300)} className="mt-4">
          <Text variant="caption" className="text-center text-destructive">
            {error.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function SuccessView({ storeName }: { storeName: string }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Animated.View entering={ZoomIn.springify().damping(12)} className="mb-6">
        <Icon as={CircleCheck} size={80} className="text-primary" />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-2">
        <Text variant="title" className="text-center">
          Store Created
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)} className="mb-10">
        <Text variant="caption" className="text-center">
          Your store is ready to accept payments
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} className="w-full bg-muted p-6">
        <Text variant="label" className="mb-1 text-center">
          Store Name
        </Text>
        <Text variant="heading" className="text-center">
          {storeName}
        </Text>
      </Animated.View>
    </View>
  );
}

export function StoreCreationProgress({
  stage,
  storeName,
  error,
  isFinalizingRetrying,
  onRetry,
  onViewStore,
  onGoHome,
}: StoreCreationProgressProps) {
  const isSuccess = stage === 'success';
  const isError = stage === 'error';
  const showActions = isSuccess || isError;

  return (
    <ScreenContainer
      bottomActionBar={
        showActions ? (
          <BottomActionBar showBackButton={false}>
            {isSuccess && (
              <>
                <Button onPress={onViewStore} size="lg" className="h-14">
                  <Text>View Store</Text>
                </Button>
                <Button variant="ghost" onPress={onGoHome} className="h-12">
                  <Text className="text-muted-foreground">Go to Home</Text>
                </Button>
              </>
            )}
            {isError && (
              <>
                <Button onPress={onRetry} size="lg" className="h-14">
                  <Text>Try Again</Text>
                </Button>
                <Button variant="ghost" onPress={onGoHome} className="h-12">
                  <Text className="text-muted-foreground">Go to Home</Text>
                </Button>
              </>
            )}
          </BottomActionBar>
        ) : undefined
      }>
      {isSuccess ? (
        <SuccessView storeName={storeName} />
      ) : (
        <ProgressView
          stage={stage}
          storeName={storeName}
          error={error}
          isFinalizingRetrying={isFinalizingRetrying}
        />
      )}
    </ScreenContainer>
  );
}
