import { View } from 'react-native';
import { NameInput } from './name-input';
import { DescriptionInput } from './description-input';
import { TaglineInput } from './tagline-input';
import { LogoPicker } from './logo-picker';
import { AddressAutocomplete } from './address-autocomplete';
import { WebsiteInput } from './website-input';
import type { StoreAddress } from '@/types/juicebox';
import type { ValidationErrors } from '@/hooks/useStoreCreationForm';

type StoreProfileFormProps = {
  name: string;
  description: string;
  tagline: string;
  logoUri: string | null;
  address: StoreAddress | null;
  website: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
  onLogoChange: (uri: string | null) => void;
  onAddressChange: (address: StoreAddress | null) => void;
  onWebsiteChange: (value: string) => void;
  errors: ValidationErrors;
  className?: string;
};

export function StoreProfileForm({
  name,
  description,
  tagline,
  logoUri,
  address,
  website,
  onNameChange,
  onDescriptionChange,
  onTaglineChange,
  onLogoChange,
  onAddressChange,
  onWebsiteChange,
  errors,
  className = '',
}: StoreProfileFormProps) {
  return (
    <View className={className}>
      <NameInput value={name} onChangeText={onNameChange} warning={errors.name} className="mb-5" />

      <LogoPicker
        imageUri={logoUri}
        onImageSelected={(uri) => onLogoChange(uri)}
        onImageRemoved={() => onLogoChange(null)}
        className="mb-5"
      />

      <TaglineInput
        value={tagline}
        onChangeText={onTaglineChange}
        warning={errors.tagline}
        className="mb-5"
      />

      <DescriptionInput value={description} onChangeText={onDescriptionChange} className="mb-5" />

      <AddressAutocomplete
        value={address}
        onSelect={onAddressChange}
        onClear={() => onAddressChange(null)}
        className="mb-5"
      />

      <WebsiteInput value={website} onChangeText={onWebsiteChange} error={errors.website} />
    </View>
  );
}
