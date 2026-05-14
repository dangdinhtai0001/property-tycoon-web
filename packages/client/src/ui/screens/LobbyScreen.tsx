import { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { NetworkManager } from '../../app/network/NetworkManager';

interface LobbyScreenProps { onBack: () => void; }

export function LobbyScreen({ onBack }: LobbyScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('');
  const setMode = useGameStore((s) => s.setMode);
  const setNetworkManager = useGameStore((s) => s.setNetworkManager);
  const serverUrl = 'http://localhost:3000';

  async function handleCreateRoom() {
    setStatus('Connecting...');
    const nm = new NetworkManager(serverUrl);
    try {
      await nm.connect();
      const rid = await nm.createRoom({ playerCount: 2, playerNames: [playerName || 'Host'], characterIds: ['ghost', 'cat'], boardId: 'basic' });
      setMode('online');
      setNetworkManager(nm);
      setStatus(`Room created! Code: ${rid}`);
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  }

  async function handleJoinRoom() {
    if (!roomId || !playerName) { setStatus('Please enter room code and name'); return; }
    setStatus('Connecting...');
    const nm = new NetworkManager(serverUrl);
    try {
      await nm.connect();
      await nm.joinRoom(roomId, playerName, 'ghost');
      setMode('online');
      setNetworkManager(nm);
      setStatus('Joined! Waiting for game to start...');
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-8">
      <button onClick={onBack} className="absolute top-4 left-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">← Back</button>
      <h1 className="text-3xl font-bold">Online Multiplayer</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('create')} className={`px-4 py-2 rounded ${tab === 'create' ? 'bg-blue-600' : 'bg-gray-700'}`}>Create Room</button>
        <button onClick={() => setTab('join')} className={`px-4 py-2 rounded ${tab === 'join' ? 'bg-blue-600' : 'bg-gray-700'}`}>Join Room</button>
      </div>
      {tab === 'create' && (
        <div className="flex flex-col gap-3">
          <input placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="px-3 py-2 rounded bg-gray-800 border border-gray-600" />
          <button onClick={handleCreateRoom} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Create Room</button>
        </div>
      )}
      {tab === 'join' && (
        <div className="flex flex-col gap-3">
          <input placeholder="Room code" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="px-3 py-2 rounded bg-gray-800 border border-gray-600" />
          <input placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="px-3 py-2 rounded bg-gray-800 border border-gray-600" />
          <button onClick={handleJoinRoom} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Join Room</button>
        </div>
      )}
      {status && <p className="text-sm text-gray-300">{status}</p>}
    </div>
  );
}
