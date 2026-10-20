// Top level: two screens (the live call and past calls), switched by the URL hash
// so a link to #/calls works without a router library. Also wakes the backend.
import { useEffect, useState } from 'react';
import { api } from './api.js';
import StartCall from './components/StartCall.jsx';
import CallScreen from './components/CallScreen.jsx';
import PastCalls from './components/PastCalls.jsx';

const screenFromHash = () => (window.location.hash === '#/calls' ? 'calls' : 'call');

export default function App() {
  const [screen, setScreen] = useState(screenFromHash);
  const [call, setCall] = useState(null); // the call in progress, if any
  const [server, setServer] = useState('waking'); // waking | up | down

  useEffect(() => {
    const onHash = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Render's free tier sleeps. Ping /health as soon as the page opens,
  // so the server is awake before the caller dials.
  useEffect(() => {
    api.health().then(() => setServer('up')).catch(() => setServer('down'));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Call guide</span>
        <nav aria-label="Screens">
          <a href="#/" aria-current={screen === 'call' ? 'page' : undefined}>
            {call ? 'Current call' : 'New call'}
          </a>
          <a href="#/calls" aria-current={screen === 'calls' ? 'page' : undefined}>Past calls</a>
        </nav>
        <span className={`server server-${server}`} role="status">
          {server === 'waking' && 'Waking the server, up to a minute'}
          {server === 'up' && 'Server ready'}
          {server === 'down' && 'Server not reachable'}
        </span>
      </header>

      {screen === 'calls' ? (
        <PastCalls />
      ) : call ? (
        <CallScreen call={call} onDone={() => setCall(null)} />
      ) : (
        <StartCall onStarted={setCall} />
      )}
    </div>
  );
}
