export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log(`[GA4] Event Tracked: ${eventName}`, params);
  } else {
    console.log(`[GA4 Mock] Event: ${eventName}`, params);
  }
};
