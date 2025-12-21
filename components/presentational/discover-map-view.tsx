import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import type { DiscoverStore } from '@/types';

type DiscoverMapViewProps = {
  stores: DiscoverStore[];
  onStorePress: (store: DiscoverStore) => void;
};

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export function DiscoverMapView({ stores, onStorePress }: DiscoverMapViewProps) {
  const storesWithCoordinates = useMemo(
    () => stores.filter((s) => s.address?.coordinates),
    [stores]
  );

  const initialRegion = useMemo(() => {
    if (storesWithCoordinates.length === 0) {
      return DEFAULT_REGION;
    }

    if (storesWithCoordinates.length === 1) {
      const store = storesWithCoordinates[0];
      return {
        latitude: store.address!.coordinates!.lat,
        longitude: store.address!.coordinates!.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const lats = storesWithCoordinates.map((s) => s.address!.coordinates!.lat);
    const lngs = storesWithCoordinates.map((s) => s.address!.coordinates!.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max(0.01, (maxLat - minLat) * 1.5);
    const deltaLng = Math.max(0.01, (maxLng - minLng) * 1.5);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }, [storesWithCoordinates]);

  if (storesWithCoordinates.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">No stores with locations available</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton>
      {storesWithCoordinates.map((store) => (
        <Marker
          key={store.id}
          coordinate={{
            latitude: store.address!.coordinates!.lat,
            longitude: store.address!.coordinates!.lng,
          }}
          onCalloutPress={() => onStorePress(store)}>
          <Callout>
            <View className="min-w-[120px] p-1">
              <Text className="font-sans-semibold">{store.name}</Text>
              <Text variant="caption" className="text-muted-foreground">
                {store.tokenSymbol}
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
