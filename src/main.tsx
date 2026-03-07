import { createRoot } from 'react-dom/client';
import './global.css';
import './utils/fpsMonitor';    // showFPS() / hideFPS()
import App from './App';

// StrictMode removed: incompatible with Supabase navigator.locks (causes 5s lock timeout)
createRoot(document.getElementById('root')!).render(<App />);

