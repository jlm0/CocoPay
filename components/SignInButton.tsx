import { forwardRef } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SignInButtonProps = {
  isLoading?: boolean;
} & TouchableOpacityProps;

export const SignInButton = forwardRef<View, SignInButtonProps>(
  ({ isLoading = false, disabled, ...touchableProps }, ref) => {
    const isIOS = Platform.OS === 'ios';
    const isDisabled = disabled || isLoading;

    const buttonStyle = isIOS ? 'bg-black' : 'bg-white border border-gray-300';

    const textColor = isIOS ? '#ffffff' : '#374151';
    const iconName = isIOS ? 'logo-apple' : 'logo-google';
    const providerName = isIOS ? 'Apple' : 'Google';

    return (
      <TouchableOpacity
        ref={ref}
        disabled={isDisabled}
        {...touchableProps}
        className={`flex-row items-center justify-center rounded-[28px] p-4 shadow-md ${buttonStyle} ${isDisabled ? 'opacity-50' : ''} ${touchableProps.className || ''}`}>
        {isLoading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            <Ionicons name={iconName} size={24} color={textColor} />
            <Text
              className={`ml-3 text-lg font-semibold ${isIOS ? 'text-white' : 'text-gray-700'}`}>
              Sign in with {providerName}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

SignInButton.displayName = 'SignInButton';
