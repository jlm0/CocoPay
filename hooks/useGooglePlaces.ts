import { useEffect, useState, useCallback, useRef } from 'react';
import GooglePlacesSdk, { PlacePrediction, Place } from 'react-native-google-places-sdk';
import type { StoreAddress } from '@/types/juicebox';

const DEBOUNCE_MS = 800;

export function useGooglePlaces() {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (!sessionStartedRef.current) {
      GooglePlacesSdk.startNewSession();
      sessionStartedRef.current = true;
    }
  }, []);

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await GooglePlacesSdk.fetchPredictions(query, {
          types: ['address'],
        });
        setPredictions(results.slice(0, 3));
      } catch (error) {
        if (__DEV__) {
          console.error('Google Places search error:', error);
        }
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const selectPlace = useCallback(async (placeId: string): Promise<StoreAddress | null> => {
    try {
      const place: Place = await GooglePlacesSdk.fetchPlaceByID(placeId, [
        'formattedAddress',
        'coordinate',
        'placeID',
      ]);

      GooglePlacesSdk.clearSession();
      GooglePlacesSdk.startNewSession();
      setPredictions([]);

      if (!place.formattedAddress) {
        return null;
      }

      return {
        formatted: place.formattedAddress,
        placeId: place.placeID ?? undefined,
        coordinates: place.coordinate
          ? {
              lat: place.coordinate.latitude,
              lng: place.coordinate.longitude,
            }
          : undefined,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Google Places fetch error:', error);
      }
      return null;
    }
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setPredictions([]);
    setIsSearching(false);
  }, []);

  return {
    predictions,
    isSearching,
    search,
    selectPlace,
    clearSearch,
  };
}
