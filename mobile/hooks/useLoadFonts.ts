import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BlackOpsOne_400Regular } from '@expo-google-fonts/black-ops-one';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';

export function useLoadFonts() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    BebasNeue_400Regular,
    BlackOpsOne_400Regular,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  return fontsLoaded;
}

export const fonts = {
  display: 'Anton_400Regular',
  brutal: 'BebasNeue_400Regular',
  ops: 'BlackOpsOne_400Regular',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;
