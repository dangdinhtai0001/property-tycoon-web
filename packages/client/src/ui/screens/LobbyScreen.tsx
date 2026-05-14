import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { NetworkManager, type PlayerInfo } from '../../app/network/NetworkManager';
import { CHARACTERS, type CharacterDef } from '@property-tycoon/engine';
import { CharacterSprite } from '../shared/CharacterSprite';

interface LobbyScreenProps { onBack: () => void; }

export function LobbyScreen({ onBack }: LobbyScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedChar, setSelectedChar] = useState<CharacterDef>(CHARACTERS[0]);
  const [status, setStatus] = useState('');

  const [nm, setNm] = useState<NetworkManager | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [inLobby, setInLobby] = useState(false);

  const setMode = useGameStore((s) => s.setMode);
  const setNetworkManager = useGameStore((s) => s.setNetworkManager);
  const setFullState = useGameStore((s) => s.setFullState);
  const serverUrl = 'http://localhost:3000';

  const setupCallbacks = useCallback((manager: NetworkManager) => {
    manager.onPlayerList = (plist) => {
      console.log('[Lobby] playerList received:', plist);
      setPlayers(plist);
    };
    manager.onPlayerJoined = (player) => {
      console.log('[Lobby] playerJoined:', player);
      setPlayers(prev => {
        const exists = prev.some(p => p.socketId === player.socketId);
        return exists ? prev : [...prev, player];
      });
    };
    manager.onPlayerLeft = (socketId) => {
      console.log('[Lobby] playerLeft:', socketId);
      setPlayers(prev => prev.filter(p => p.socketId !== socketId));
    };
    manager.onGameStarted = (initialState) => {
      console.log('[Lobby] gameStarted');
      setFullState(initialState);
    };
    manager.onError = (msg) => {
      console.log('[Lobby] error:', msg);
      setStatus(msg);
    };
    manager.onDisconnect = () => {
      console.log('[Lobby] disconnected');
      setStatus('Disconnected from server');
    };
  }, [setFullState]);

  useEffect(() => {
    return () => { if (nm) { /* keep connection, store owns it */ } };
  }, [nm]);

  async function handleCreateRoom() {
    setStatus('Connecting...');
    const manager = new NetworkManager(serverUrl);
    try {
      await manager.connect();
      setupCallbacks(manager);
      const rid = await manager.createRoom({
        playerCount: 6,
        playerNames: [playerName || 'Host', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'],
        characterIds: ['ghost', 'cat', 'magician', 'rouge', 'light knight', 'ghost'],
        boardId: 'basic',
      });
      const result = await manager.joinRoom(rid, playerName || 'Host', selectedChar.id);
      setRoomId(rid);
      setPlayers(result.players);
      setIsHost(true);
      setInLobby(true);
      setNm(manager);
      setMode('online');
      setNetworkManager(manager);
      setStatus('');
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  }

  async function handleJoinRoom() {
    if (!roomId || !playerName) { setStatus('Please enter room code and name'); return; }
    setStatus('Connecting...');
    const manager = new NetworkManager(serverUrl);
    try {
      await manager.connect();
      setupCallbacks(manager);
      const result = await manager.joinRoom(roomId.trim().toUpperCase(), playerName, selectedChar.id);
      setPlayers(result.players);
      setIsHost(result.isHost);
      setInLobby(true);
      setNm(manager);
      setMode('online');
      setNetworkManager(manager);
      setStatus('');
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  }

  function handleStartGame() { nm?.requestStartGame(roomId); }

  function handleLeave() {
    nm?.leaveRoom(roomId);
    nm?.disconnect();
    setInLobby(false);
    setNm(null);
    setPlayers([]);
    setMode('offline');
    setNetworkManager(null);
    onBack();
  }

  function CharacterPicker() {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-400">Choose your character</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChar(c)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                selectedChar.id === c.id
                  ? 'border-blue-400 bg-blue-900/30 scale-105'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <CharacterSprite charId={c.id} className="w-12 h-12" />
              <span className="text-[10px] font-semibold">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER: Room Lobby ---
  if (inLobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-6 p-8">
        <button onClick={handleLeave} className="absolute top-4 left-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">← Leave</button>
        <h1 className="text-3xl font-bold">Game Lobby</h1>

        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest">Room Code</p>
          <p className="text-5xl font-black tracking-[0.3em] text-blue-400">{roomId}</p>
          <p className="text-xs text-gray-500 mt-2">Share this code with friends</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-lg font-bold mb-3">
            Players ({players.length})
            {isHost && <span className="text-xs text-purple-400 ml-2">You are the host</span>}
          </h2>
          <div className="flex flex-col gap-2">
            {players.map((p, i) => (
              <div key={p.socketId} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
                <CharacterSprite charId={p.characterId} className="w-8 h-8 rounded-full" />
                <span className="font-semibold">{p.playerName}</span>
                {i === 0 && <span className="text-xs text-purple-400 ml-auto">HOST</span>}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3 border border-dashed border-gray-700">
                <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-500">
                  {players.length + i + 1}
                </span>
                <span className="text-gray-500 italic">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={handleStartGame} className="px-8 py-4 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30 transition-all">
            🚀 BẮT ĐẦU VÁN
          </button>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-300 animate-pulse">Đợi host bắt đầu ván...</p>
            <p className="text-sm text-gray-500 mt-1">Hãy chắc chắn tất cả mọi người đã sẵn sàng</p>
          </div>
        )}

        {status && <p className="text-sm text-red-400">{status}</p>}
      </div>
    );
  }

  // --- RENDER: Create / Join ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-4 p-8">
      <button onClick={onBack} className="absolute top-4 left-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">← Back</button>
      <h1 className="text-3xl font-bold">Online Multiplayer</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('create')} className={`px-4 py-2 rounded ${tab === 'create' ? 'bg-blue-600' : 'bg-gray-700'}`}>Create Room</button>
        <button onClick={() => setTab('join')} className={`px-4 py-2 rounded ${tab === 'join' ? 'bg-blue-600' : 'bg-gray-700'}`}>Join Room</button>
      </div>

      <div className="w-full max-w-sm mb-2">
        <CharacterPicker />
      </div>

      {tab === 'create' && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <input placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="px-3 py-2 rounded bg-gray-800 border border-gray-600" />
          <button onClick={handleCreateRoom} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Create Room</button>
        </div>
      )}
      {tab === 'join' && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <input placeholder="Room code" value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())} className="px-3 py-2 rounded bg-gray-800 border border-gray-600 text-center text-2xl tracking-widest font-bold" maxLength={4} />
          <input placeholder="Your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="px-3 py-2 rounded bg-gray-800 border border-gray-600" />
          <button onClick={handleJoinRoom} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Join Room</button>
        </div>
      )}
      {status && <p className="text-sm text-red-400">{status}</p>}
    </div>
  );
}
