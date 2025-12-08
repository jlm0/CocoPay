import { View } from 'react-native';
import { usePara } from '@/providers/ParaProvider';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/Button';

export default function HomePage() {
  const { wallets, logout } = usePara();

  const primaryWallet = wallets[0];
  const truncatedAddress = primaryWallet
    ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
    : '';

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-16">
      <Text variant="heading" className="mb-6">
        Home
      </Text>

      {primaryWallet && (
        <Card className="mb-6">
          <Text variant="caption" className="mb-1">
            Wallet Address
          </Text>
          <Text variant="subheading">{truncatedAddress}</Text>
        </Card>
      )}

      <View className="mt-auto pb-12">
        <Button title="Sign Out" variant="outline" onPress={logout} />
      </View>
    </View>
  );
}
