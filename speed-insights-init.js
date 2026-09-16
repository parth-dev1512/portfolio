// Speed Insights initialization for static HTML
// This uses the Vercel-provided script endpoint when deployed
(function() {
  // Initialize the Speed Insights queue
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };

  // Create and inject the Speed Insights script
  const script = document.createElement('script');
  
  // In production (on Vercel), use the auto-configured endpoint
  // In development/other environments, use the debug script
  const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  script.src = isDev 
    ? 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js'
    : '/_vercel/speed-insights/script.js';
  
  script.defer = true;
  
  // Add SDK information
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. This is expected in local development without Vercel deployment.');
  };
  
  document.head.appendChild(script);
})();
