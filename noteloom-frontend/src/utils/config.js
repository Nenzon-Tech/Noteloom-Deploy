// Global Configuration

const rawApiBase = import.meta.env.VITE_API_BASE !== undefined && import.meta.env.VITE_API_BASE !== null 
  ? import.meta.env.VITE_API_BASE 
  : (import.meta.env.PROD ? '' : 'http://localhost:4000');

// Strip accidental wrapping quotes (like double quotes entered in Vercel UI)
export const API_BASE = typeof rawApiBase === 'string' 
  ? rawApiBase.replace(/^['"]|['"]$/g, '') 
  : '';

export const COLLEGE_CONFIG = {
  // Default values
  logoUrl: "webdata/clg-logo/IEM-Kolkata.png", 
  bannerUrl: "", 
  collegeName: "Institute of Engineering Management Kolkata",
  useDefaultFooter: false
};