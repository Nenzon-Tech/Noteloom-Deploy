import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import api, { authHeaders } from '../lib/api';
import { saveSessionToken, getSessionToken, clearSessionToken } from '../lib/storage';
import { API_BASE } from '../lib/constants';

interface User {
  id: string;
  email: string;
  name: string;
  uid: string;
}

interface Profile {
  id: string;
  role: string;
  college: string;
  full_name: string;
  isIndividual?: boolean;
}

interface MenuItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'LMS' | 'ERP';
}

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  const validateSession = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        setIsSessionValid(false);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return false;
      }

      const response = await fetch(`${API_BASE}/session/info`, {
        headers: authHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ id: data.user.id, email: data.user.email, name: data.user.name, uid: data.user.uid });
        setProfile({
          id: data.user.id,
          role: data.role,
          college: data.tenant?.name || 'System',
          full_name: data.user.name,
          isIndividual: data.role === 'individual_student' || data.isIndividual,
        });
        setIsSessionValid(true);
        setLoading(false);
        return true;
      } else {
        setIsSessionValid(false);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      setLoading(false);
      return false;
    }
  }, []);

  const fetchMenu = useCallback(async (): Promise<MenuItem[]> => {
    try {
      const token = await getSessionToken();
      if (!token) return [];
      const response = await fetch(`${API_BASE}/session/menu`, {
        headers: authHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return false;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock NoteLoom with Biometrics',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch {
      return false;
    }
  };

  const login = async (token: string): Promise<void> => {
    await saveSessionToken(token);
    await validateSession();
    await fetchMenu();
  };

  const logout = async (): Promise<void> => {
    try {
      const token = await getSessionToken();
      if (token) {
        fetch(`${API_BASE}/api/auth/signout`, {
          method: 'POST',
          headers: authHeaders(token),
        }).catch(() => {});
      }
    } catch {}
    await clearSessionToken();
    setUser(null);
    setProfile(null);
    setMenuItems([]);
    setIsSessionValid(false);
  };

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  return {
    user,
    profile,
    menuItems,
    loading,
    isSessionValid,
    validateSession,
    fetchMenu,
    authenticateWithBiometrics,
    login,
    logout,
  };
}
