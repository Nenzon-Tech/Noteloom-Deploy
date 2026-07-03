import { API_BASE } from '@/utils/config';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Ensure API_BASE matches your config


export const useITSessionManager = () => {
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [itUser, setITUser] = useState(null);
  const [isITAuthenticated, setIsITAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkITSession = async () => {
    try {
      const token = localStorage.getItem('itSessionToken');
      
      if (!token) {
        setITUser(null);
        setIsITAuthenticated(false);
        setLoading(false);
        return false;
      }

      const res = await axios.get(`${API_BASE}/session/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const validRoles = ['it_admin', 'it_user', 'noteloom_admin', 'noteloom_manager'];
      
      if (res.data.user && validRoles.includes(res.data.role)) {
        setITUser(res.data.user);
        setIsITAuthenticated(true);
        setIsSessionValid(true);
        return true;
      } else {
        clearITSession(); 
        return false;
      }
    } catch (error) {
      clearITSession(); 
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearITSession = async () => {
    try {
      const token = localStorage.getItem('itSessionToken');
      if (token) {
        await axios.post(`${API_BASE}/it-auth/signout`, {}, {
  headers: { Authorization: `Bearer ${localStorage.getItem('itSessionToken')}` }
});
      }
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      localStorage.removeItem('itSessionToken');
      setITUser(null);
      setIsITAuthenticated(false);
      setIsSessionValid(false);
      setLoading(false);
      navigate('/it-login'); 
    }
  };

  useEffect(() => {
    checkITSession();
  }, []);

  return { 
    itUser,
    loading, 
    isITAuthenticated, 
    isSessionValid, 
    clearITSession,
    checkITSession
  };
};