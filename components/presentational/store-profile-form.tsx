import { View } from 'react-native';
import { NameInput } from './name-input';
import { DescriptionInput } from './description-input';
import { LogoPicker } from './logo-picker';
import { AddressAutocomplete } from './address-autocomplete';
import { WebsiteInput } from './website-input';
import type { StoreAddress } from '@/types/juicebox';
import type { ValidationErrors } from '@/hooks/useStoreCreationForm';

type StoreProfileFormProps = {
  name: string;
  description: string;
  logoUri: string | null;
  address: StoreAddress | null;
  website: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLogoChange: (uri: string | null) => void;
  onAddressChange: (address: StoreAddress | null) => void;
  onWebsiteChange: (value: string) => void;
  errors: ValidationErrors;
  disabled?: boolean;
  className?: string;
};

export function StoreProfileForm({
  name,
  description,
  logoUri,
  address,
  website,
  onNameChange,
  onDescriptionChange,
  onLogoChange,
  onAddressChange,
  onWebsiteChange,
  errors,
  disabled,
  className = '',
}: StoreProfileFormProps) {
  return (
    <View className={className}>
      <LogoPicker
        imageUri={logoUri}
        onImageSelected={(uri) => onLogoChange(uri)}
        onImageRemoved={() => onLogoChange(null)}
        disabled={disabled}
        className="mb-6"
      />

      <NameInput value={name} onChangeText={onNameChange} disabled={disabled} className="mb-5" />

      <DescriptionInput
        value={description}
        onChangeText={onDescriptionChange}
        disabled={disabled}
        className="mb-5"
      />

      <AddressAutocomplete
        value={address}
        onSelect={onAddressChange}
        onClear={() => onAddressChange(null)}
        disabled={disabled}
        className="mb-5"
      />

      <WebsiteInput
        value={website}
        onChangeText={onWebsiteChange}
        error={errors.website}
        disabled={disabled}
      />
    </View>
  );
}
