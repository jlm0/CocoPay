import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IoniconsName;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color = '#374151', className = '' }: IconProps) {
  return <Ionicons name={name} size={size} color={color} className={className} />;
}
