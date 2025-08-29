import { useEffect } from 'react';

const ChatBot = () => {
  useEffect(() => {
    let myLandbot;

    function initLandbot() {
      if (!myLandbot) {
        const script = document.createElement('script');
        script.type = 'module';
        script.async = true;
        script.addEventListener('load', function() {
          if (window.Landbot) {
            myLandbot = new window.Landbot.Popup({
              configUrl: 'https://storage.googleapis.com/landbot.online/v3/H-3111571-CL94004SD21Z9YK3/index.json',
            });
          }
        });
        script.src = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    }

    // Inicializar chatbot en primer mouseover o touchstart
    window.addEventListener('mouseover', initLandbot, { once: true });
    window.addEventListener('touchstart', initLandbot, { once: true });

    // Cleanup al desmontar el componente
    return () => {
      window.removeEventListener('mouseover', initLandbot);
      window.removeEventListener('touchstart', initLandbot);
    };
  }, []);

  // No renderiza nada visible, el chatbot es un popup
  return null;
};

export default ChatBot;
