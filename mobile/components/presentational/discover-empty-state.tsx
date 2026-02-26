import { View } from 'react-native';
import { Store, Search, MapPin } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type DiscoverEmptyStateProps = {
  type: 'no-stores' | 'no-results' | 'no-map-stores';
  searchQuery?: string;
};

const EMPTY_STATE_CONFIG = {
  'no-stores': {
    icon: Store,
    title: 'No stores yet',
    description: 'Be the first to create a store and start accepting payments',
  },
  'no-results': {
    icon: Search,
    title: 'No stores found',
    description: 'Try a different search term',
  },
  'no-map-stores': {
    icon: MapPin,
    title: 'No stores with locations',
    description: 'Stores without addresses cannot be shown on the map',
  },
};

export function DiscoverEmptyState({ type, searchQuery }: DiscoverEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Icon as={config.icon} size={48} className="mb-4 text-muted-foreground" />
      <Text className="mb-2 text-center font-brutal text-lg">{config.title}</Text>
      <Text className="text-center text-muted-foreground">
        {type === 'no-results' && searchQuery
          ? `No stores matching "${searchQuery}"`
          : config.description}
      </Text>
    </View>
  );
}
