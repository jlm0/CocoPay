import { useMemo } from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import { MAP_STYLE } from '@/lib/map-style';
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
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={MAP_STYLE}
        showsUserLocation
        showsMyLocationButton>
        {storesWithCoordinates.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.address!.coordinates!.lat,
              longitude: store.address!.coordinates!.lng,
            }}>
            <RNText style={styles.markerEmoji}>🥥</RNText>
            <Callout tooltip onPress={() => onStorePress(store)}>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <View>
                    <RNText style={styles.calloutTitle}>{store.name}</RNText>
                    <RNText style={styles.calloutSubtitle}>{store.tokenSymbol}</RNText>
                  </View>
                  <RNText style={styles.calloutChevron}>›</RNText>
                </View>
                <View style={styles.calloutAction}>
                  <RNText style={styles.calloutActionText}>Tap to view store</RNText>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerEmoji: {
    fontSize: 32,
  },
  callout: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  calloutTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0F172A',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  calloutChevron: {
    fontSize: 24,
    color: '#2DD4BF',
    fontWeight: '300',
  },
  calloutAction: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  calloutActionText: {
    fontSize: 12,
    color: '#2DD4BF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
