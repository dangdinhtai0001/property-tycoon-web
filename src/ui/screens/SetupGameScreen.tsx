import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { type GameConfig } from '../../game-engine/types/game';
import { DEFAULT_CONFIG } from '../../game-engine/state/setupGame';
import { Users, Shield, Zap, Trash2, Plus, Info, CheckCircle2, AlertCircle, Landmark, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS } from '../../game-engine/data/characters';
import { CharacterSprite } from '../shared/CharacterSprite';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const SetupGameScreen: React.FC = () => {
  const { dispatch } = useGameStore();
  const [players, setPlayers] = useState<{ name: string; color: string; token: string }[]>([
    { name: CHARACTERS[0].name, color: COLORS[0], token: CHARACTERS[0].id },
    { name: CHARACTERS[0].name, color: COLORS[1], token: CHARACTERS[0].id },
  ]);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  const addPlayer = () => {
    if (players.length < 6) {
      // Find next available color and token
      const usedColors = new Set(players.map(p => p.color));
      const nextColor = COLORS.find(c => !usedColors.has(c)) || COLORS[players.length];
      const nextToken = CHARACTERS[0].id;

      setPlayers([...players, {
        name: CHARACTERS[0].name,
        color: nextColor,
        token: nextToken
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: 'name' | 'color' | 'token', value: string) => {
    const newPlayers = [...players];
    const updates: Partial<typeof newPlayers[0]> = { [field]: value };
    if (field === 'token') {
      const char = CHARACTERS.find(c => c.id === value);
      if (char) updates.name = char.name;
    }
    newPlayers[index] = { ...newPlayers[index], ...updates };
    setPlayers(newPlayers);
  };

  const [gameMode, setGameMode] = useState<'classic' | 'quick' | 'friendly'>('classic');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const setPresetMode = (mode: 'classic' | 'quick' | 'friendly') => {
    setGameMode(mode);
    switch (mode) {
      case 'classic':
        setConfig(prev => ({ ...prev, startingCash: 1500, passStartBonus: 200, rentMultiplier: 1 }));
        break;
      case 'quick':
        setConfig(prev => ({ ...prev, startingCash: 1000, passStartBonus: 200, rentMultiplier: 2 }));
        break;
      case 'friendly':
        setConfig(prev => ({ ...prev, startingCash: 2000, passStartBonus: 300, rentMultiplier: 1 }));
        break;
    }
  };

  const handleStartGame = () => {
    dispatch({ 
      type: 'START_GAME', 
      payload: { 
        players: players.map(p => ({ 
          ...p, 
          avatarUrl: p.token // This is the charId (e.g., 'ghost_blue')
        })), 
        config 
      } 
    });
  };

  const validation = useMemo(() => {
    const colors = players.map(p => p.color);
    const hasDuplicateColor = new Set(colors).size !== colors.length;
    const hasEmptyName = players.some(p => !p.name.trim());
    return { 
      isValid: !hasDuplicateColor && !hasEmptyName,
      hasDuplicateColor,
      hasEmptyName
    };
  }, [players]);

  return (
    <div className="fixed inset-0 flex flex-col items-center p-6 bg-slate-50 overflow-hidden">
      {/* Ambient Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-50 pointer-events-none"
        style={{ backgroundImage: 'url(/assets/bg/main-menu.png)' }}
      />
      
      {/* Soft Gradient Overlay */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-tr from-white/40 via-transparent to-white/60 pointer-events-none" />

      {/* Floating Elements for "Game" feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[5%] text-blue-500/10"
        >
          <Dices size={80} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[5%] right-[5%] text-amber-500/10"
        >
          <Landmark size={100} />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center space-y-1 mb-6"
      >
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sảnh Chờ</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
          <span>Mua đất</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>Thu thuê</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>Xây đế chế</span>
        </p>
      </motion.div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl flex-1 min-h-0 mb-6">
        {/* Left Card: Players */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl p-6 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Người chơi</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{players.length} / 6 Thành viên</p>
              </div>
            </div>
            {validation.isValid ? (
              <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <CheckCircle2 size={14} />
                Hợp lệ
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                <AlertCircle size={14} />
                Chưa sẵn sàng
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {players.map((p, idx) => (
                <motion.div 
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-5 bg-white border border-slate-100 rounded-[2rem] flex flex-col gap-4 group hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Token Selection */}
                    <div className="relative group/token">
                      <button className="relative w-16 h-16 group cursor-pointer outline-none">
                        <div className="relative w-full h-full overflow-hidden bg-slate-100/50 rounded-2xl border-2 border-slate-200 shadow-inner group-hover:border-blue-400 transition-colors">
                          <CharacterSprite charId={p.token} />
                        </div>
                      </button>
                      
                      <div className="absolute top-full left-0 mt-2 p-4 bg-white shadow-2xl rounded-[2rem] border border-slate-100 z-50 flex flex-wrap gap-4 opacity-0 pointer-events-none group-focus-within/token:opacity-100 group-focus-within/token:pointer-events-auto transition-all transform scale-95 group-focus-within/token:scale-100 min-w-[200px]">
                        {CHARACTERS.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => updatePlayer(idx, 'token', c.id)}
                            className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${p.token === c.id ? 'border-blue-500 scale-110 shadow-lg' : 'border-slate-50 hover:border-blue-200'}`}
                            title={c.name}
                          >
                            <div className="relative w-full h-full">
                              <CharacterSprite charId={c.id} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5">
                      <input 
                        type="text" 
                        value={p.name}
                        onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                        className={`w-full bg-transparent border-none focus:ring-0 outline-none font-black text-slate-900 text-lg placeholder-slate-300 ${!p.name.trim() ? 'text-rose-600' : ''}`}
                        placeholder="Tên ông trùm..."
                      />
                      {/* Color Bar */}
                      <div className="flex gap-2.5">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updatePlayer(idx, 'color', c)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${p.color === c ? 'border-slate-900 scale-110 shadow-md' : 'border-white opacity-40 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {players.length > 2 && (
                      <button 
                        onClick={() => removePlayer(idx)}
                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length < 6 && (
              <button 
                onClick={addPlayer}
                className="w-full py-5 border-2 border-dashed border-slate-200 text-slate-500 font-black rounded-[2rem] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-2">
                  <Plus size={20} />
                  <span>THÊM NGƯỜI CHƠI</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-60">Thách thức thêm đối thủ</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Right Card: Rules */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl p-6 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white flex flex-col min-h-0"
        >
          <div className="flex items-center gap-4 text-slate-900 mb-6">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Luật chơi</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tùy biến ván đấu</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            {/* Game Mode Selection */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">Chế độ chơi</label>
              <div className="grid grid-cols-3 gap-3 p-2 bg-slate-100/50 rounded-[1.8rem] border border-slate-100">
                {[
                  { id: 'classic', label: 'Cổ điển', icon: '🏛️' },
                  { id: 'quick', label: 'Siêu tốc', icon: '⚡' },
                  { id: 'friendly', label: 'Thân thiện', icon: '🤝' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPresetMode(mode.id as any)}
                    className={`py-3.5 px-2 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-2 ${gameMode === mode.id ? 'bg-white text-blue-600 shadow-md scale-[1.02] border border-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <span className="text-xl">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-8 px-1">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Tiền khởi điểm</label>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Đề xuất: $1,500</p>
                  </div>
                  <span className="font-black text-slate-900 text-3xl tracking-tighter">${config.startingCash.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>$500</span>
                    <span>$3,000</span>
                  </div>
                  <input 
                    type="range" min="500" max="3000" step="100"
                    value={config.startingCash}
                    onChange={(e) => setConfig({...config, startingCash: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Thưởng qua START</label>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Đề xuất: $200</p>
                  </div>
                  <span className="font-black text-slate-900 text-3xl tracking-tighter">${config.passStartBonus.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                  <input 
                    type="range" min="0" max="500" step="50"
                    value={config.passStartBonus}
                    onChange={(e) => setConfig({...config, passStartBonus: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options Group */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full px-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] hover:text-blue-600 transition-colors"
              >
                Tùy chọn nâng cao
                <motion.span animate={{ rotate: showAdvanced ? 180 : 0 }}>
                  <Plus size={14} />
                </motion.span>
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    {[
                      { id: 'auction', label: 'Đấu giá tài sản', desc: 'Mở đấu giá khi từ chối mua', icon: <Landmark size={18} />, active: config.enableAuction, action: (checked: boolean) => setConfig({...config, enableAuction: checked}), color: 'indigo' },
                      { id: 'debug', label: 'Chế độ Debug', desc: 'Cho phép công cụ hỗ trợ test', icon: <Zap size={18} />, active: config.enableDebug, action: (checked: boolean) => setConfig({...config, enableDebug: checked}), color: 'rose' }
                    ].map(item => (
                      <label key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-100`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 text-xs">{item.label}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.desc}</span>
                          </div>
                        </div>
                        <div className="relative inline-flex items-center">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={item.active}
                            onChange={(e) => item.action(e.target.checked)}
                          />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer: Summary Bar & Action */}
      <motion.div 
        className="relative z-10 w-full max-w-6xl flex flex-col items-center gap-4 mt-auto"
      >
        {/* Horizontal Summary Bar */}
        <div className="w-full bg-slate-900 p-4 md:px-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-blue-900/20 border border-white/10">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-12">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quy mô</p>
              <p className="text-lg font-black">{players.length} Người chơi</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tài chính</p>
              <p className="text-lg font-black">${config.startingCash.toLocaleString()}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chế độ</p>
              <p className="text-lg font-black capitalize">
                {gameMode === 'classic' ? 'Cổ điển' : gameMode === 'quick' ? 'Siêu tốc' : 'Thân thiện'}
              </p>
            </div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Info size={18} className="text-blue-400" />
            </div>
            <div className="text-[10px] font-bold text-slate-300 leading-tight">
              Sẵn sàng xây dựng<br />đế chế của bạn?
            </div>
          </div>
        </div>

        {/* Validation Errors & Start Button */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          {!validation.isValid && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1 text-rose-500 font-bold text-[9px] uppercase tracking-wider bg-rose-50 px-4 py-2 rounded-xl border border-rose-100"
            >
              {validation.hasEmptyName && <p>• Tên không được để trống</p>}
              {validation.hasDuplicateColor && <p>• Chọn màu khác nhau</p>}
            </motion.div>
          )}

          <motion.button 
            whileHover={validation.isValid ? { scale: 1.02, y: -2 } : {}}
            whileTap={validation.isValid ? { scale: 0.98 } : {}}
            onClick={handleStartGame}
            disabled={!validation.isValid}
            className={`w-full py-4 text-xl font-black rounded-[2rem] transition-all relative overflow-hidden ${validation.isValid ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            BẮT ĐẦU VÁN ĐẤU
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
