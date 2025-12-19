import { View, Pressable } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MapPin, X } from 'lucide-react-native';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { StoreAddress } from '@/types/juicebox';
import { HEX_COLORS } from '@/lib/theme';

type AddressAutocompleteProps = {
  value: StoreAddress | null;
  onSelect: (address: StoreAddress) => void;
  onClear: () => void;
  className?: string;
};

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

export function AddressAutocomplete({
  value,
  onSelect,
  onClear,
  className = '',
}: AddressAutocompleteProps) {
  if (value) {
    return (
      <View className={className}>
        <View className="mb-2 flex-row items-center justify-between">
          <Label>Location</Label>
          <Text variant="caption">Optional</Text>
        </View>
        <View className="flex-row items-center justify-between rounded-md border border-input bg-transparent px-3 py-3">
          <View className="flex-1 flex-row items-center gap-2">
            <Icon as={MapPin} className="text-primary" size={16} />
            <Text className="flex-1" numberOfLines={1}>
              {value.formatted}
            </Text>
          </View>
          <Pressable onPress={onClear} className="p-1">
            <Icon as={X} className="text-muted-foreground" size={16} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className={className}>
      <View className="mb-2 flex-row items-center justify-between">
        <Label>Location</Label>
        <Text variant="caption">Optional</Text>
      </View>
      <GooglePlacesAutocomplete
        placeholder="Search for address..."
        onPress={(data, details) => {
          if (data && details) {
            onSelect({
              formatted: data.description,
              placeId: data.place_id,
              coordinates: details.geometry?.location
                ? {
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  }
                : undefined,
            });
          }
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
        }}
        fetchDetails
        enablePoweredByContainer={false}
        debounce={300}
        minLength={2}
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: 'transparent',
          },
          textInput: {
            height: 44,
            color: HEX_COLORS.foreground,
            fontSize: 16,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: HEX_COLORS.border,
            borderRadius: 6,
            paddingHorizontal: 12,
          },
          listView: {
            backgroundColor: HEX_COLORS.background,
            borderWidth: 1,
            borderColor: HEX_COLORS.border,
            borderRadius: 6,
            marginTop: 4,
          },
          row: {
            backgroundColor: HEX_COLORS.background,
            paddingVertical: 12,
            paddingHorizontal: 12,
          },
          description: {
            color: HEX_COLORS.foreground,
            fontSize: 14,
          },
          separator: {
            backgroundColor: HEX_COLORS.border,
            height: 1,
          },
        }}
      />
    </View>
  );
}
