import { API_BASE } from '@/utils/config';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

export const useSessionManager = () => {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());
  const sessionCheckRef = useRef(null);
  const navigate = useNavigate();

  // Update last activity time
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', lastActivityRef.current.toString());
  };

  // Fetch session info
  const checkSession = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      setIsSessionValid(false);
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/session/info`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          uid: data.user.uid
        });

        setProfile({
          id: data.user.id,
          role: data.role,
          college: data.tenant?.name || 'System',
          full_name: data.user.name,
          isIndividual: data.role === 'individual_student' || data.isIndividual
        });

        setIsSessionValid(true);
        setLoading(false);
        return true;
      } else {
        // ❌ Do NOT auto-clear session here (prevents race-condition logout)
        setIsSessionValid(false);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setLoading(false); 
      return false;
    }
  };

  const clearSession = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      try {
        await fetch(`${API_BASE}/api/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    
    // Clear Session Data ONLY (Keep College Code)
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('sessionStart');
    
    // Reset state
    setUser(null);
    setProfile(null);
    setIsSessionValid(false);
    
    // ✅ SMART REDIRECT: Go to specific college login if code exists
    const savedCode = localStorage.getItem('selectedCollegeCode');
    if (savedCode) {
        navigate(`/login?code=${savedCode}`);
    } else {
        navigate('/college-selection'); 
    }
  };

  useEffect(() => {
    let mounted = true;
    const sessionToken = localStorage.getItem('sessionToken');

    if (!sessionToken) {
      setLoading(false);
      setIsSessionValid(false);
      return;
    }

    const initializeAuth = async () => {
      if (mounted) await checkSession();
    };

    initializeAuth();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    sessionCheckRef.current = setInterval(async () => {
      if (mounted) await checkSession();
    }, 60000);

    return () => {
      mounted = false;
      if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  return { 
    user, 
    profile,
    loading, 
    isSessionValid, 
    clearSession, 
    updateActivity,
    checkSession
  };
};