import React, { useState, useEffect, useRef, useCallback } from 'react';

function App() {
    // State for code in each editor
    const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Preview</title>
    <style>/* Your CSS will go here */</style>
</head>
<body>
    <div class="container">
        <h1>Welcome to the Enhanced Editor!</h1>
        <p>Start coding below to see live changes.</p>
        <button id="myButton">Click for Magic!</button>
    </div>
    <script>// Your JavaScript will go here</script>
</body>
</html>`);
    const [cssCode, setCssCode] = useState(`body {
    font-family: 'Inter', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    background-color: #1a202c; /* Deep charcoal */
    color: #e2e8f0; /* Off-white */
    overflow: hidden; /* Prevent body scroll */
}

.container {
    background-color: #2d3748; /* Dark blue-gray */
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    text-align: center;
    max-width: 700px;
    animation: fadeInScale 0.8s ease-out forwards;
}

h1 {
    color: #81e6d9; /* Teal */
    font-size: 2.5em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

p {
    font-size: 1.1em;
    line-height: 1.7;
    margin-bottom: 30px;
    color: #cbd5e0; /* Light gray */
}

#myButton {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Purple-blue gradient */
    color: white;
    padding: 15px 30px;
    border: none;
    border-radius: 50px; /* Pill shape */
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
    outline: none;
}

#myButton:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

#myButton:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #5a67d8 0%, #683b8b 100%);
}

@keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
`);
    const [jsCode, setJsCode] = useState(`document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript for preview loaded!');
    const myButton = document.getElementById('myButton');
    if (myButton) {
        myButton.addEventListener('click', () => {
            // Using a custom modal-like message instead of alert()
            const existingModal = document.getElementById('custom-message-modal');
            if (existingModal) existingModal.remove(); // Remove existing to prevent duplicates

            const messageBox = document.createElement('div');
            messageBox.id = 'custom-message-modal';
            messageBox.style.cssText = \`
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #2c5282; /* Darker blue */
                color: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.5);
                z-index: 1000;
                font-family: 'Inter', sans-serif;
                animation: slideIn 0.4s ease-out forwards;
                min-width: 250px;
                text-align: center;
            \`;
            messageBox.innerHTML = \`
                <p style="font-size: 1.2em; margin-bottom: 20px;">🎉 Button Successfully Clicked! 🎉</p>
                <button style="
                    background-color: #4299e1; /* Blue */
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1em;
                    transition: background-color 0.3s ease;
                " onclick="this.parentNode.remove()">Close</button>
            \`;
            document.body.appendChild(messageBox);
        });
    }
});

// Add a simple animation for the modal
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = \`
    @keyframes slideIn {
        from { opacity: 0; transform: translate(-50%, -70%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
    }
\`;
document.head.appendChild(styleSheet);
`);

    // State for layout: 'side-by-side', 'full-preview'
    const [layout, setLayout] = useState('side-by-side');
    const [message, setMessage] = useState(''); // For user messages (e.g., share status)
    const [monacoEditorMainLoaded, setMonacoEditorMainLoaded] = useState(false); // Tracks if 'editor.main' is loaded

    // Refs for Monaco Editor containers
    const htmlEditorContainerRef = useRef(null);
    const cssEditorContainerRef = useRef(null);
    const jsEditorContainerRef = useRef(null);

    // Refs for Monaco Editor instances
    const htmlMonacoInstanceRef = useRef(null);
    const cssMonacoInstanceRef = useRef(null);
    const jsMonacoInstanceRef = useRef(null);

    // Effect to load 'vs/editor/editor.main' and set monacoEditorMainLoaded
    useEffect(() => {
        // Assume Monaco loader script is now in public/index.html
        if (window.require && window.monaco) {
            console.log("Monaco loader available from index.html. Attempting to load 'editor.main'...");
            window.require(['vs/editor/editor.main'], () => {
                console.log("'editor.main' loaded. Monaco is ready for instantiation!");
                setMonacoEditorMainLoaded(true);
            });
        } else {
            console.warn("Monaco loader (window.require, window.monaco) not found. This might be a timing issue.");
            const retryLoadTimeout = setTimeout(() => {
                if (window.require && window.monaco) {
                    window.require(['vs/editor/editor.main'], () => {
                        console.log("Retry: 'editor.main' loaded. Monaco is ready!");
                        setMonacoEditorMainLoaded(true);
                    });
                } else {
                    console.error("Monaco loader still not available after retry. Editor will not load properly.");
                    setMessage("Failed to load editor. Please check your internet connection and console for errors.");
                }
            }, 500);
            return () => clearTimeout(retryLoadTimeout);
        }

        // Cleanup: Dispose editor instances on component unmount
        return () => {
            if (htmlMonacoInstanceRef.current) htmlMonacoInstanceRef.current.dispose();
            if (cssMonacoInstanceRef.current) cssMonacoInstanceRef.current.dispose();
            if (jsMonacoInstanceRef.current) jsMonacoInstanceRef.current.dispose();
            console.log('Monaco editor instances disposed on component unmount.');
        };
    }, []);

    // Effect to initialize Monaco editors once 'editor.main' is loaded and refs are available
    useEffect(() => {
        if (!monacoEditorMainLoaded) {
            console.log('Monaco editor main module not loaded yet, skipping editor initialization in useEffect.');
            return;
        }

        const createMonacoEditor = (containerRef, language, code, onCodeChange, instanceRef) => {
            if (containerRef.current && !instanceRef.current) {
                console.log(`Attempting to create Monaco editor for ${language}. Container:`, containerRef.current);
                instanceRef.current = window.monaco.editor.create(containerRef.current, {
                    value: code,
                    language: language,
                    theme: 'vs-dark', // Dark theme for sleek look
                    automaticLayout: true,
                    minimap: { enabled: false },
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    fontSize: 16,
                    fontFamily: 'Inter, sans-serif',
                });
                console.log(`Monaco editor for ${language} created. Instance:`, instanceRef.current);

                instanceRef.current.onDidChangeModelContent(() => {
                    const newValue = instanceRef.current.getValue();
                    if (onCodeChange && newValue !== code) {
                        onCodeChange(newValue);
                        console.log(`${language} code updated in React state.`);
                    }
                });
            } else if (instanceRef.current) {
                if (instanceRef.current.getValue() !== code) {
                    console.log(`Updating Monaco editor (${language}) value to match React state.`);
                    instanceRef.current.setValue(code);
                }
                instanceRef.current.layout(); // Ensure layout is always up-to-date
            }
        };

        createMonacoEditor(htmlEditorContainerRef, 'html', htmlCode, setHtmlCode, htmlMonacoInstanceRef);
        createMonacoEditor(cssEditorContainerRef, 'css', cssCode, setCssCode, cssMonacoInstanceRef);
        createMonacoEditor(jsEditorContainerRef, 'javascript', jsCode, setJsCode, jsMonacoInstanceRef);

        const handleResize = () => {
            console.log("Window resized, triggering Monaco editors layout.");
            if (htmlMonacoInstanceRef.current) htmlMonacoInstanceRef.current.layout();
            if (cssMonacoInstanceRef.current) cssMonacoInstanceRef.current.layout();
            if (jsMonacoInstanceRef.current) jsMonacoInstanceRef.current.layout();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [monacoEditorMainLoaded, htmlCode, cssCode, jsCode]);

    const updatePreview = useCallback(() => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe && iframe.contentDocument) {
            const doc = iframe.contentDocument;
            const fullHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Live Preview</title>
                    <style>${cssCode}</style>
                </head>
                <body>
                    ${htmlCode.replace(/<\/?(html|head|body|!doctype).*?>/g, '')}
                    <script>${jsCode}</script>
                </body>
                </html>
            `;
            doc.open();
            doc.write(fullHtml);
            doc.close();
            console.log('Iframe preview updated successfully.');
        } else {
            console.warn('Iframe or its contentDocument not ready for preview update.');
        }
    }, [htmlCode, cssCode, jsCode]);

    useEffect(() => {
        console.log('Code state changed, scheduling preview update...');
        const handler = setTimeout(() => {
            updatePreview();
        }, 300);
        return () => {
            console.log('Clearing previous preview update timeout.');
            clearTimeout(handler);
        };
    }, [htmlCode, cssCode, jsCode, updatePreview]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encodedCode = params.get('code');
        if (encodedCode) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(encodedCode)));
                if (decoded.html) setHtmlCode(decoded.html);
                if (decoded.css) setCssCode(decoded.css);
                if (decoded.js) setJsCode(decoded.js);
                setMessage('Code loaded from URL!');
                console.log('Code loaded from URL parameters.');
            } catch (error) {
                console.error("Error decoding URL code:", error);
                setMessage('Error loading code from URL.');
            }
        }
    }, []);

    const shareCode = () => {
        const code = {
            html: htmlCode,
            css: cssCode,
            js: jsCode,
        };
        const encoded = btoa(encodeURIComponent(JSON.stringify(code)));
        const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
        const tempInput = document.createElement('textarea');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setMessage('Share URL copied to clipboard!');
        setTimeout(() => setMessage(''), 3000);
        console.log('Share URL generated and copied:', shareUrl);
    };

    // Message box component
    const MessageBox = ({ message, onClose }) => {
        if (!message) return null;
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#48bb78', // A nice green for success messages
                color: 'white',
                padding: '15px 25px',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 1000,
                opacity: 0, // Start hidden for animation
                animation: 'fadeInUp 0.5s ease-out forwards',
                fontSize: '1.1em'
            }}>
                <span>{message}</span>
                <button onClick={onClose} style={{
                    marginLeft: '20px',
                    color: 'white',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    outline: 'none',
                    lineHeight: '1',
                }}>
                    &times;
                </button>
                {/* Keyframes for animation, ensuring it doesn't conflict */}
                <style>
                    {`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px) translateX(-50%); }
                        to { opacity: 1; transform: translateY(0) translateX(-50%); }
                    }
                    `}
                </style>
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#1a202c', // Deep charcoal background for the whole app
            color: '#e2e8f0', // Off-white text
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden', // Prevent scrollbars on main app div
        }}>
            {/* Header */}
            <header style={{
                flexShrink: 0,
                backgroundColor: '#2d3748', // Dark blue-gray for header
                padding: '20px 30px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px',
                borderRadius: '0 0 15px 15px', // Rounded bottom corners for header
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#81e6d9', letterSpacing: '1px' }}>CodeCraft Editor</h1> {/* Teal */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => setLayout('side-by-side')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '25px', // More rounded buttons
                            transition: 'all 0.3s ease',
                            backgroundColor: layout === 'side-by-side' ? '#4299e1' : '#4a5568', // Blue / Darker gray
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95em'
                        }}
                    >
                        Side-by-Side
                    </button>
                    <button
                        onClick={() => setLayout('full-preview')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '25px',
                            transition: 'all 0.3s ease',
                            backgroundColor: layout === 'full-preview' ? '#4299e1' : '#4a5568',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95em'
                        }}
                    >
                        Full Preview
                    </button>
                    <button
                        onClick={shareCode}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '25px',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#9f7aea', // Soft purple
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95em'
                        }}
                    >
                        Share Code
                    </button>
                </div>
            </header>

            {/* Main content area */}
            <main style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                overflow: 'hidden', // Important for editor resizing and scrollbars
                padding: '15px',
                gap: '15px', // Spacing between editor and preview sections
            }}>
                {/* Editors Section */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        flexGrow: 1,
                        width: layout === 'full-preview' ? '0' : (window.innerWidth < 768 ? '100%' : '50%'),
                        overflow: 'hidden',
                        opacity: layout === 'full-preview' ? '0' : '1', // Fade out/in
                        visibility: layout === 'full-preview' ? 'hidden' : 'visible',
                        transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
                    }}
                >
                    {monacoEditorMainLoaded ? (
                        <>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '4px', backgroundColor: '#263238', borderRadius: '10px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' }}>
                                <div style={{ padding: '10px 15px', backgroundColor: '#37474f', fontSize: '0.9em', fontWeight: '600', color: '#b0bec5', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #455a64' }}>HTML</div>
                                <div ref={htmlEditorContainerRef} style={{ flexGrow: 1, minHeight: '150px' }}></div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '4px', backgroundColor: '#263238', borderRadius: '10px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' }}>
                                <div style={{ padding: '10px 15px', backgroundColor: '#37474f', fontSize: '0.9em', fontWeight: '600', color: '#b0bec5', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #455a64' }}>CSS</div>
                                <div ref={cssEditorContainerRef} style={{ flexGrow: 1, minHeight: '150px' }}></div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: '4px', backgroundColor: '#263238', borderRadius: '10px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' }}>
                                <div style={{ padding: '10px 15px', backgroundColor: '#37474f', fontSize: '0.9em', fontWeight: '600', color: '#b0bec5', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #455a64' }}>JavaScript</div>
                                <div ref={jsEditorContainerRef} style={{ flexGrow: 1, minHeight: '150px' }}></div>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#263238', margin: '4px', borderRadius: '10px', color: '#b0bec5', minHeight: '300px', fontSize: '1.2em' }}>
                            Loading Editor...
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div
                    style={{
                        flexGrow: 1,
                        width: layout === 'side-by-side' ? (window.innerWidth < 768 ? '100%' : '50%') : '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: '4px',
                        backgroundColor: '#ffffff', // White background for the preview
                        borderRadius: '10px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)', // Softer shadow
                        overflow: 'hidden',
                        transition: 'width 0.3s ease-in-out'
                    }}
                >
                    <div style={{ padding: '10px 15px', backgroundColor: '#cfd8dc', color: '#37474f', fontWeight: '600', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', borderBottom: '1px solid #90a4ae' }}>Live Preview</div>
                    <iframe
                        id="preview-iframe"
                        title="Live Code Preview"
                        style={{ width: '100%', height: '100%', border: '0', borderRadius: '0 0 10px 10px' }}
                        sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                </div>
            </main>

            {/* Message Box */}
            <MessageBox message={message} onClose={() => setMessage('')} />

            {/* Footer - Added "Made by Dev" */}
            <footer style={{
                flexShrink: 0,
                backgroundColor: '#2d3748', // Dark blue-gray, same as header
                padding: '15px 30px',
                textAlign: 'center',
                color: '#e2e8f0', // Off-white text, similar to body text
                fontSize: '0.9em',
                fontWeight: '400',
                borderTop: '1px solid #4a5568', // Slightly lighter border than header bottom
                borderRadius: '15px 15px 0 0', // Rounded top corners
                marginTop: 'auto', // Push to the bottom
            }}>
                Made by Dev
            </footer>
        </div>
    );
}

export default App;
