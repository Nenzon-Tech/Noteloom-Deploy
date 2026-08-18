import * as SecureStore from 'expo-secure-store';

export const setSecure = async (key: string, value: string) => {
  try { await SecureStore.setItemAsync(key, value); } catch {}
};

export const getSecure = async (key: string): Promise<string | null> => {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
};

export const removeSecure = async (key: string) => {
  try { await SecureStore.deleteItemAsync(key); } catch {}
};

export const saveSessionToken = (token: string) => setSecure('sessionToken', token);
export const getSessionToken = () => getSecure('sessionToken');
export const clearSessionToken = () => removeSecure('sessionToken');

const BIOMETRIC_KEY = 'biometricEnabled';
export const isBiometricEnabled = async (): Promise<boolean> => {
  const value = await getSecure(BIOMETRIC_KEY);
  return value === 'true';
};
export const setBiometricEnabled = (enabled: boolean) => setSecure(BIOMETRIC_KEY, String(enabled));
export const clearBiometricEnabled = () => removeSecure(BIOMETRIC_KEY);
