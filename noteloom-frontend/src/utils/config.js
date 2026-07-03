// Global Configuration

export const API_BASE = import.meta.env.VITE_API_BASE !== undefined && import.meta.env.VITE_API_BASE !== null 
  ? import.meta.env.VITE_API_BASE 
  : 'http://localhost:4000';

export const COLLEGE_CONFIG = {
  // Default values
  logoUrl: "webdata/clg-logo/IEM-Kolkata.png", 
  bannerUrl: "", 
  collegeName: "Institute of Engineering Management Kolkata",
  useDefaultFooter: false
};