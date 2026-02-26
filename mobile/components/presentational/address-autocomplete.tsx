import { useState } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import type { PlacePrediction } from 'react-native-google-places-sdk';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import type { StoreAddress } from '@/types/juicebox';
import { cn } from '@/lib/utils';

type AddressAutocompleteProps = {
  value: StoreAddress | null;
  onSelect: (address: StoreAddress) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
};

export function AddressAutocomplete({
  value,
  onSelect,
  onClear,
  disabled,
  className = '',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { predictions, isSearching, search, selectPlace, clearSearch } = useGooglePlaces();

  const handleTextChange = (text: string) => {
    setQuery(text);
    search(text);
    setShowDropdown(text.length >= 2);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    const address = await selectPlace(prediction.placeID);
    if (address) {
      onSelect(address);
      setQuery('');
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    onClear();
    setQuery('');
    clearSearch();
    setShowDropdown(false);
  };

  if (value) {
    return (
      <View className={className}>
        <View className="mb-2 flex-row items-center justify-between">
          <Label>Location</Label>
          <Text variant="fine">Optional</Text>
        </View>
        <View className="flex-row items-center justify-between border-2 border-input bg-transparent px-3 py-3">
          <View className="flex-1 flex-row items-center gap-2">
            <Icon as={MapPin} className="text-primary" size={16} />
            <Text className="flex-1" numberOfLines={1}>
              {value.formatted}
            </Text>
          </View>
          <Pressable onPress={handleClear} disabled={disabled} className="p-1">
            <Icon as={X} className="text-muted-foreground" size={16} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className={cn('relative z-50', className)}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Location</Label>
        <Text variant="fine">Optional</Text>
      </View>

      <View className="relative">
        <Input
          value={query}
          onChangeText={handleTextChange}
          placeholder="Search for your store address"
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          editable={!disabled}
        />
        {isSearching && (
          <View className="absolute right-3 top-3">
            <Spinner size="small" />
          </View>
        )}
      </View>

      {showDropdown && predictions.length > 0 && (
        <View className="absolute left-0 right-0 top-[76px] z-50 border-2 border-border bg-background shadow-brutal-md">
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placeID}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => handleSelectPrediction(item)}
                className={cn(
                  'px-3 py-3 active:bg-muted',
                  index < predictions.length - 1 && 'border-b border-border'
                )}>
                <Text className="text-sm">{item.description}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
