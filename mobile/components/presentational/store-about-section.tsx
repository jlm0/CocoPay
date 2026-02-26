import { useState, useCallback } from 'react';
import { View, Pressable, Linking } from 'react-native';
import { MapPin, Globe } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { StoreAddress } from '@/types';

type StoreAboutSectionProps = {
  description?: string;
  address?: StoreAddress;
  website?: string;
  onAddressPress?: () => void;
  className?: string;
};

const DESCRIPTION_LINE_LIMIT = 3;

export function StoreAboutSection({
  description,
  address,
  website,
  onAddressPress,
  className,
}: StoreAboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);

  const handleTextLayout = useCallback(
    (event: { nativeEvent: { lines: { text: string }[] } }) => {
      if (!isExpanded && event.nativeEvent.lines.length > DESCRIPTION_LINE_LIMIT) {
        setShowExpandButton(true);
      }
    },
    [isExpanded]
  );

  const handleWebsitePress = useCallback(() => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      Linking.openURL(url);
    }
  }, [website]);

  const hasContent = description || address || website;

  if (!hasContent) {
    return null;
  }

  return (
    <View className={cn('gap-4', className)}>
      {description && (
        <View className="gap-1 border-l-2 border-border pl-4">
          <Text
            variant="body"
            numberOfLines={isExpanded ? undefined : DESCRIPTION_LINE_LIMIT}
            onTextLayout={handleTextLayout}>
            {description}
          </Text>
          {showExpandButton && (
            <Pressable onPress={() => setIsExpanded(!isExpanded)} hitSlop={8}>
              <Text className="font-mono text-sm text-primary">
                {isExpanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {(address || website) && (
        <View className="gap-2">
          {address && (
            <Pressable
              onPress={onAddressPress}
              disabled={!onAddressPress}
              className="active:opacity-70">
              <View className="flex-row items-center gap-1.5">
                <Icon as={MapPin} size={16} className="text-muted-foreground" />
                <Text
                  variant="caption"
                  className={`text-muted-foreground ${onAddressPress ? 'underline' : ''}`}>
                  {address.formatted}
                </Text>
              </View>
            </Pressable>
          )}

          {website && (
            <Pressable onPress={handleWebsitePress} className="active:opacity-70">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Globe} size={16} className="text-muted-foreground" />
                <Text variant="caption" className="text-muted-foreground underline">
                  {website}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
