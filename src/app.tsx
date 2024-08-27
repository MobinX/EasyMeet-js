import React from 'react';
import ReactDOM from 'react-dom/client'; // Note the change from 'react-dom' to 'react-dom/client'
import App from './Main'; // Import your main component
import process from 'process';
window.process = process; // Add process to the global object


// console.log("process.env.NODE_ENV", process.env.NODE_ENV);
// Create a root element for your React application
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the App component into the root element
root.render(
 
    <App />

);