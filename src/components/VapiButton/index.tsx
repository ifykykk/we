import { useEffect } from 'react';

declare global {
  interface Window {
    vapiSDK: any;
  }
}

const VapiButton = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.vapiSDK.run({
        apiKey: 'a6616a06-4ad8-4b28-8089-e3a98ffe4b86',
        assistant: 'abf4afa2-c4e0-43d8-a1b6-6ae110980cd3',
        config: {
          position: 'bottom-left',
          buttonStyle: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
          },
        },
      });
    };

    const container = document.getElementById('custom-vapi-container-wrapper');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default VapiButton;