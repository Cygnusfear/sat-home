// Injected by Traefik to enable keyboard shortcuts in iframes
(function() {
    'use strict';
    
    // Only run if we're inside an iframe
    if (window.self === window.top) return;
    
    document.addEventListener('keydown', function(e) {
        const isMod = e.metaKey || e.ctrlKey;
        
        // Check for our keyboard shortcuts
        if ((isMod && e.key === 'k') || (isMod && e.key === 'b')) {
            // Send message to parent window
            window.parent.postMessage({
                type: 'keyboard-shortcut',
                key: e.key,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey
            }, '*');
            
            // Prevent default behavior in iframe
            e.preventDefault();
            e.stopPropagation();
        }
    });
})();