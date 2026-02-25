import { useState, useCallback, useEffect, forwardRef } from 'react';
import { View, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Copy, Check } from 'lucide-react-native';
import { BottomSheet, type BottomSheetMethods } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useParaAccount } from '@/hooks/useParaAccount';
import { truncateAddress } from '@/lib/format/address';

const ReceiveBottomSheet = forwardRef<BottomSheetMethods>((_, ref) => {
  const { address } = useParaAccount();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      setCopied(true);
    }
  }, [address]);

  return (
    <BottomSheet ref={ref}>
      <View className="items-center">
        <Text variant="title" className="mb-6">
          Receive USDC
        </Text>

        <View className="mb-6 rounded-2xl bg-white p-4">
          <QRCode value={address ?? ''} size={200} backgroundColor="white" color="black" />
        </View>

        <Text variant="small" className="mb-2 text-muted-foreground">
          Your deposit address
        </Text>

        <Pressable
          onPress={handleCopy}
          className="flex-row items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 active:bg-muted">
          <Text className={copied ? 'text-sm text-primary' : 'font-mono text-sm'}>
            {copied ? 'Copied' : truncateAddress(address ?? '')}
          </Text>
          <Icon
            as={copied ? Check : Copy}
            size={18}
            className={copied ? 'text-primary' : 'text-muted-foreground'}
          />
        </Pressable>
      </View>
    </BottomSheet>
  );
});

ReceiveBottomSheet.displayName = 'ReceiveBottomSheet';

export { ReceiveBottomSheet };
