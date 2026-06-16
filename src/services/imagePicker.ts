import * as ImagePicker from 'expo-image-picker';

export type PickStatus = 'granted' | 'denied' | 'undetermined' | 'cancelled';

export interface PickResult {
  status: PickStatus;
  uri?: string;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.7,
};

export async function pickFromGallery(): Promise<PickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: permission.canAskAgain ? 'undetermined' : 'denied' };
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) return { status: 'cancelled' };
  return { status: 'granted', uri: result.assets[0].uri };
}

export async function takePhoto(): Promise<PickResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { status: permission.canAskAgain ? 'undetermined' : 'denied' };
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled) return { status: 'cancelled' };
  return { status: 'granted', uri: result.assets[0].uri };
}
