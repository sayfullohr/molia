'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { GameSession, FriendItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Users,
  CheckCircle,
  Crown,
  Sparkles,
  LogIn,
  Circle,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export function GamesView() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialGameId = searchParams.get('id');

  const [activeGame, setActiveGame] = useState<GameSession | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<'TIC_TAC_TOE' | 'QUIZ' | 'CHECKERS'>('TIC_TAC_TOE');
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [onlineData, setOnlineData] = useState<{
    friends: FriendItem[];
    allFriends: FriendItem[];
    communityPlayers: any[];
  }>({
    friends: [],
    allFriends: [],
    communityPlayers: [],
  });
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<any | null>(null);

  // Checkers drag / move selection
  const [selectedPiece, setSelectedPiece] = useState<{ r: number; c: number } | null>(null);

  const loadOpponents = async () => {
    try {
      const [res, inviteRes] = await Promise.all([
        api.getOnlineUsers(),
        api.getPendingGameInvite().catch(() => null),
      ]);

      if (res.success && res.data) {
        setOnlineData(res.data);
        setFriends(res.data.allFriends || []);
      }

      if (inviteRes && inviteRes.success && inviteRes.data) {
        setPendingInvite(inviteRes.data);
      } else {
        setPendingInvite(null);
      }
    } catch (e) {
      api.getFriends().then((res) => {
        if (res.success) {
          setFriends(res.data);
          setOnlineData({
            friends: res.data.filter((f: FriendItem) => f.isOnline),
            allFriends: res.data,
            communityPlayers: [],
          });
        }
      });
    }
  };

  useEffect(() => {
    if (user) {
      // Send game presence heartbeat immediately and poll
      api.sendGameHeartbeat().catch(() => {});
      loadOpponents();

      const opponentInterval = setInterval(loadOpponents, 3000);
      const heartbeatInterval = setInterval(() => {
        api.sendGameHeartbeat().catch(() => {});
      }, 10000);

      return () => {
        clearInterval(opponentInterval);
        clearInterval(heartbeatInterval);
      };
    }
  }, [user]);

  useEffect(() => {
    if (initialGameId) {
      loadGame(initialGameId);
    }
  }, [initialGameId]);

  // Polling active game state
  useEffect(() => {
    if (!activeGame || activeGame.status === 'COMPLETED' || activeGame.status === 'DRAW') return;

    const pollInterval = activeGame.status === 'WAITING' ? 1200 : 2000;
    const interval = setInterval(() => {
      loadGame(activeGame.id);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [activeGame]);

  const loadGame = async (id: string) => {
    try {
      const res = await api.getGame(id);
      if (res.success) setActiveGame(res.data);
    } catch (e) {
      // Ignore
    }
  };

  const handleStartGame = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.createGame(
        selectedGameType,
        selectedFriendId || null
      );
      if (res.success) {
        setActiveGame(res.data);
      }
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleTicTacToeMove = async (cellIndex: number) => {
    if (!activeGame || activeGame.status !== 'IN_PROGRESS') return;
    try {
      const res = await api.makeGameMove(activeGame.id, { cellIndex });
      if (res.success) setActiveGame(res.data);
    } catch (e: any) {
      alert(e.message || 'Xato harakat');
    }
  };

  const handleQuizAnswer = async (optionIndex: number) => {
    if (!activeGame || activeGame.status !== 'IN_PROGRESS') return;
    try {
      const res = await api.makeGameMove(activeGame.id, { optionIndex });
      if (res.success) setActiveGame(res.data);
    } catch (e: any) {
      alert(e.message || 'Xato javob');
    }
  };

  const handleCheckersClick = async (r: number, c: number) => {
    if (!activeGame || activeGame.status !== 'IN_PROGRESS') return;
    const gameState = JSON.parse(activeGame.gameState);
    const piece = gameState.board[r][c];

    if (!selectedPiece) {
      if (piece) {
        setSelectedPiece({ r, c });
      }
    } else {
      // Move from selectedPiece to (r, c)
      try {
        const res = await api.makeGameMove(activeGame.id, {
          from: selectedPiece,
          to: { r, c },
        });
        if (res.success) {
          setActiveGame(res.data);
          setSelectedPiece(null);
        }
      } catch (e: any) {
        setSelectedPiece(null);
        alert(e.message || 'Noto‘g‘ri shashka yurishi');
      }
    }
  };

  const handleRematch = async () => {
    if (!activeGame) return;
    try {
      const res = await api.rematchGame(activeGame.id);
      if (res.success) setActiveGame(res.data);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Multiplayer O‘yinlar
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Do‘stlar bilan intellektual va strategik bellashuvlar (Har bir g‘alaba uchun XP!)
        </p>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>O‘yinlarni boshlash, yutuqlar (XP) olish va do‘stlar bilan o‘ynash uchun hisobingizga kiring.</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAuthModal(true)}
            className="text-xs shrink-0 self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5 mr-1" />
            Kirish / Ro‘yxatdan o‘tish
          </Button>
        </div>
      )}

      {/* Real-time Incoming Game Invite Banner */}
      {pendingInvite && !activeGame && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              🎮
            </div>
            <div>
              <p className="font-bold text-sm">
                <span className="underline decoration-amber-300 decoration-2">{pendingInvite.player1.username}</span> sizni{' '}
                {pendingInvite.gameType === 'TIC_TAC_TOE'
                  ? 'Tic Tac Toe'
                  : pendingInvite.gameType === 'QUIZ'
                  ? 'Moliyaviy Quiz'
                  : 'Shashka'}{' '}
                o‘ynashga taklif qildi!
              </p>
              <p className="text-xs text-blue-100">
                U hozir o‘yinda sizni kutmoqda. Birgalikda boshlash uchun qo‘shiling!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-md"
              onClick={async () => {
                try {
                  const res = await api.joinGame(pendingInvite.id);
                  if (res.success && res.data) {
                    setActiveGame(res.data);
                    setPendingInvite(null);
                  }
                } catch (e) {
                  // Ignore
                }
              }}
            >
              ⚡ O‘yinga qo‘shilish
            </Button>
          </div>
        </div>
      )}

      {!activeGame ? (
        /* Game Selection & Launcher */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tic Tac Toe */}
          <Card
            onClick={() => setSelectedGameType('TIC_TAC_TOE')}
            className={`cursor-pointer transition-all border-2 ${
              selectedGameType === 'TIC_TAC_TOE'
                ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-3">
              ✕◯
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tic Tac Toe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Klassik 3x3 x va o o‘yini. 2 kishilik onlayn bellashuv.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>G‘alaba uchun +20 XP</span>
            </div>
          </Card>

          {/* Financial Quiz */}
          <Card
            onClick={() => setSelectedGameType('QUIZ')}
            className={`cursor-pointer transition-all border-2 ${
              selectedGameType === 'QUIZ'
                ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-3">
              🧠
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Moliyaviy Quiz
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              5 raundlik moliyaviy va intellektual savollar. Ballar hisoblanadi.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>G‘alaba uchun +20 XP</span>
            </div>
          </Card>

          {/* Checkers */}
          <Card
            onClick={() => setSelectedGameType('CHECKERS')}
            className={`cursor-pointer transition-all border-2 ${
              selectedGameType === 'CHECKERS'
                ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl mb-3">
              🏁
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Shashka (Checkers)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              8x8 haqiqiy shashka taxtasi. Yurishlar va urishlar serverda tekshiriladi.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>G‘alaba uchun +20 XP</span>
            </div>
          </Card>

          {/* Opponent Selection & Start button */}
          <Card className="md:col-span-3 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Raqibni tanlang va o‘yinni boshlang
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Onlayn do‘stingizni tanlang yoki yakka tartibda mashg‘ulot qiling
                </p>
              </div>

              <Link
                href="/social"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Yangi do‘st qidirish
              </Link>
            </div>

            {/* Quick Online Friends Bar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                🟢 Onlayn Do‘stlar ({onlineData.friends.length})
              </label>

              {onlineData.friends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {onlineData.friends.map((f) => {
                    const isSelected = selectedFriendId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFriendId(isSelected ? '' : f.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                              {f.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {f.username}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Level {f.level} • {f.streak} kun
                            </p>
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <Badge variant="success" className="text-[10px] py-0 px-2">
                              Tanlangan ✓
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                              Tanlash
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Hozircha onlayn do‘stlaringiz yo‘q. Do‘stlar bo‘limidan yangi do‘st orttirishingiz yoki pastdan tanlashingiz mumkin.</span>
                  </div>
                  <Link
                    href="/social"
                    className="text-blue-600 font-semibold hover:underline shrink-0"
                  >
                    Do‘st qo‘shish →
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown Selector and Launch Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                  O‘yinchini tanlang (Hozir o‘yinda bo‘lganlar)
                </label>
                <select
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">⚔️ Raqibsiz (Yakka mashg‘ulot)</option>

                  {/* Online Friends currently active in games */}
                  {onlineData.friends.filter((f) => f.isOnline).length > 0 && (
                    <optgroup label="🟢 O‘yindagi Onlayn Do‘stlar">
                      {onlineData.friends
                        .filter((f) => f.isOnline)
                        .map((f) => (
                          <option key={f.id} value={f.id}>
                            🟢 {f.username} (Level {f.level})
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Community Players who are ACTUALLY currently active on the games page */}
                  {onlineData.communityPlayers?.length > 0 && (
                    <optgroup label="🌐 Hozir O‘yinda Bo‘lgan O‘yinchilar">
                      {onlineData.communityPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          🟢 {p.username} (Level {p.level} - O‘yinda)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {onlineData.friends.filter((f) => f.isOnline).length === 0 &&
                  (!onlineData.communityPlayers || onlineData.communityPlayers.length === 0) && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hozirda boshqa o‘yinchi yo‘q. Yakka mashg‘ulot qilishingiz mumkin.
                    </p>
                  )}
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleStartGame}
                  isLoading={loading}
                  className="w-full h-11 shadow-sm font-semibold"
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  {selectedFriendId ? 'Raqib bilan o‘yinni boshlash' : 'O‘yinni boshlash'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Active Game Arena */
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Game Top Banner */}
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={() => setActiveGame(null)}>
                ← Chiqish
              </Button>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeGame.gameType === 'TIC_TAC_TOE'
                    ? 'Tic Tac Toe'
                    : activeGame.gameType === 'QUIZ'
                    ? 'Moliyaviy Quiz'
                    : 'Shashka'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeGame.player1.username} vs {activeGame.player2?.username || 'Kutilmoqda...'}
                </p>
              </div>
            </div>

            <div>
              {activeGame.status === 'COMPLETED' ? (
                <Badge variant="success">O‘yin tugadi</Badge>
              ) : activeGame.status === 'DRAW' ? (
                <Badge variant="warning">Durrang</Badge>
              ) : activeGame.status === 'WAITING' ? (
                <Badge variant="info">Raqib kutilmoqda</Badge>
              ) : (
                <Badge variant="default">
                  {activeGame.currentTurn === user?.id ? 'Sizning navbatingiz' : 'Raqib navbati'}
                </Badge>
              )}
            </div>
          </Card>

          {/* Winner announcement banner */}
          {activeGame.winner && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center animate-slideUp">
              <Crown className="w-8 h-8 text-amber-500 mx-auto mb-1" />
              <h4 className="text-base font-bold text-amber-900 dark:text-amber-200">
                🎉 G‘olib: {activeGame.winner.username}! (+20 XP)
              </h4>
              <Button size="sm" onClick={handleRematch} className="mt-3">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Qayta o‘ynash (Rematch)
              </Button>
            </div>
          )}

          {activeGame.status === 'DRAW' && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
              <p className="font-bold text-sm">Durrang natija! Do‘stlik g‘alaba qozondi.</p>
              <Button size="sm" onClick={handleRematch} className="mt-2">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Qayta o‘ynash
              </Button>
            </div>
          )}

          {/* 1. TIC TAC TOE ARENA */}
          {activeGame.gameType === 'TIC_TAC_TOE' && (
            <Card className="p-6 flex flex-col items-center">
              {(() => {
                const state = JSON.parse(activeGame.gameState);
                return (
                  <div
                    className="grid grid-cols-3 gap-2.5 w-64 h-64 aspect-square"
                    style={{
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(3, 1fr)',
                    }}
                  >
                    {state.board.map((cell: string | null, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleTicTacToeMove(idx)}
                        disabled={
                          cell !== null ||
                          activeGame.status !== 'IN_PROGRESS' ||
                          Boolean(activeGame.player2Id && activeGame.currentTurn !== user?.id)
                        }
                        className={`w-full h-full rounded-2xl border-2 text-2xl font-bold flex items-center justify-center transition-all ${
                          cell === 'X'
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400'
                            : cell === 'O'
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cell}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* 2. QUIZ ARENA */}
          {activeGame.gameType === 'QUIZ' && (
            <Card className="p-6 space-y-4">
              {(() => {
                const state = JSON.parse(activeGame.gameState);
                const currentQ = state.questions[state.currentQuestionIndex];
                const isP1 = user?.id === activeGame.player1Id;
                const hasAnswered = isP1 ? state.player1Answered : state.player2Answered;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span>
                        Savol {state.currentQuestionIndex + 1} / {state.questions.length}
                      </span>
                      <span>
                        Hisob: {state.player1Score} - {state.player2Score}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentQ.question}
                    </h4>

                    <div className="space-y-2">
                      {currentQ.options.map((opt: string, idx: number) => (
                        <button
                          key={idx}
                          disabled={hasAnswered || activeGame.status !== 'IN_PROGRESS'}
                          onClick={() => handleQuizAnswer(idx)}
                          className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-500 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {hasAnswered && activeGame.status === 'IN_PROGRESS' && (
                      <p className="text-xs text-center text-amber-500 font-medium">
                        Javobingiz qabul qilindi. Raqibingiz javob berishini kuting...
                      </p>
                    )}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* 3. CHECKERS ARENA */}
          {activeGame.gameType === 'CHECKERS' && (
            <Card className="p-4 flex flex-col items-center">
              {(() => {
                const state = JSON.parse(activeGame.gameState);
                return (
                  <div className="space-y-3 flex flex-col items-center">
                    <div
                      className="w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 aspect-square border-4 border-amber-950 dark:border-amber-900 rounded-2xl overflow-hidden shadow-2xl select-none grid"
                      style={{
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gridTemplateRows: 'repeat(8, 1fr)',
                      }}
                    >
                      {state.board.map((row: any[], r: number) =>
                        row.map((cell: any, c: number) => {
                          const isDarkCell = (r + c) % 2 === 1;
                          const isSelected = selectedPiece?.r === r && selectedPiece?.c === c;

                          return (
                            <div
                              key={`${r}-${c}`}
                              onClick={() => handleCheckersClick(r, c)}
                              className={`w-full h-full aspect-square flex items-center justify-center cursor-pointer select-none transition-colors relative ${
                                isDarkCell
                                  ? 'bg-[#78350f] dark:bg-[#451a03] hover:brightness-110'
                                  : 'bg-[#fef3c7] dark:bg-[#fde68a]'
                              } ${isSelected ? 'ring-4 ring-blue-500 ring-inset z-10' : ''}`}
                            >
                              {cell && (
                                <div
                                  className={`w-[78%] h-[78%] aspect-square rounded-full shadow-lg flex items-center justify-center font-bold text-xs select-none transition-transform active:scale-95 ${
                                    cell.player === 1
                                      ? 'bg-gradient-to-b from-white to-slate-200 text-slate-800 border-2 border-slate-300 shadow-slate-900/30'
                                      : 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border-2 border-slate-700 shadow-black/60'
                                  } ${cell.isKing ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                                >
                                  {cell.isKing ? '👑' : ''}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <p className="text-xs text-center text-slate-400">
                      {selectedPiece
                        ? 'Endi boradigan katakni tanlang'
                        : 'Yurmoqchi bo‘lgan toshingizni tanlang'}
                    </p>
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
