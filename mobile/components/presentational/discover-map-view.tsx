import { useMemo, useRef } from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import { MAP_STYLE } from '@/lib/map-style';
import type { DiscoverStore } from '@/types';

type DiscoverMapViewProps = {
  stores: DiscoverStore[];
  onMarkerPress: (store: DiscoverStore) => void;
  focusedStoreId?: string;
};

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const ZOOM_DELTA = 0.01;
const ANIMATION_DURATION = 300;

export function DiscoverMapView({ stores, onMarkerPress, focusedStoreId }: DiscoverMapViewProps) {
  const mapRef = useRef<MapView>(null);

  const storesWithCoordinates = useMemo(
    () => stores.filter((s) => s.address?.coordinates),
    [stores]
  );

  const initialRegion = useMemo(() => {
    if (focusedStoreId) {
      const focusedStore = storesWithCoordinates.find((s) => s.id === focusedStoreId);
      if (focusedStore) {
        return {
          latitude: focusedStore.address!.coordinates!.lat,
          longitude: focusedStore.address!.coordinates!.lng,
          latitudeDelta: ZOOM_DELTA,
          longitudeDelta: ZOOM_DELTA,
        };
      }
    }

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
  }, [storesWithCoordinates, focusedStoreId]);

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
        ref={mapRef}
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
            }}
            onPress={() => {
              mapRef.current?.animateToRegion(
                {
                  latitude: store.address!.coordinates!.lat,
                  longitude: store.address!.coordinates!.lng,
                  latitudeDelta: ZOOM_DELTA,
                  longitudeDelta: ZOOM_DELTA,
                },
                ANIMATION_DURATION
              );
              onMarkerPress(store);
            }}>
            <RNText style={styles.markerEmoji}>🥥</RNText>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerEmoji: {
    fontSize: 32,
  },
});
