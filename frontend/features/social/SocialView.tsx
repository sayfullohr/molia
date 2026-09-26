'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { FriendItem, ChatMessage } from '../../types';
import { formatTimeOnly } from '../../lib/utils';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Gamepad2,
  Send,
  Flame,
  Award,
  Circle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth/AuthModal';

export function SocialView() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ received: any[]; sent: any[] }>({
    received: [],
    sent: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<FriendItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadFriendsAndRequests = async () => {
    try {
      const [fRes, reqRes] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests(),
      ]);
      if (fRes.success) setFriends(fRes.data);
      if (reqRes.success) setPendingRequests(reqRes.data);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    loadFriendsAndRequests();
  }, []);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.searchUsers(searchQuery);
        if (res.success) setSearchResults(res.data);
      } catch (e) {
        // Ignore
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load chat messages when activeChatFriend changes or poll every 4s
  useEffect(() => {
    if (!activeChatFriend) return;

    const loadChat = async () => {
      try {
        const res = await api.getMessages(activeChatFriend.id);
        if (res.success) setMessages(res.data);
      } catch (e) {
        // Ignore
      }
    };

    loadChat();
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [activeChatFriend]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendFriendRequest = async (username: string) => {
    try {
      await api.sendFriendRequest(username);
      setSearchQuery('');
      setSearchResults([]);
      loadFriendsAndRequests();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  const handleRespondRequest = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await api.respondFriendRequest(id, action);
      loadFriendsAndRequests();
    } catch (e) {
      // Ignore
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatFriend || !messageInput.trim()) return;

    setSendLoading(true);
    try {
      const res = await api.sendMessage(activeChatFriend.id, messageInput.trim());
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setMessageInput('');
      }
    } catch (e) {
      // Ignore
    } finally {
      setSendLoading(false);
    }
  };

  const handleInviteToGame = async (gameType: string) => {
    if (!activeChatFriend) return;
    try {
      const res = await api.createGame(gameType, activeChatFriend.id);
      if (res.success) {
        // Send a chat message informing the friend
        await api.sendMessage(
          activeChatFriend.id,
          `🎮 Sizni ${gameType} o‘yiniga taklif qildim! O‘yinlar bo‘limiga kiring.`
        );
        router.push(`/games?id=${res.data.id}`);
      }
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Do‘stlar & Chat
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Foydalanuvchilarni toping, muloqot qiling va o‘yinga taklif qiling
        </p>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
            Do‘stlar orttirish, chatda yozishish va o‘yinlarga taklif yuborish uchun hisobingizga kiring.
          </p>
          <Button
            size="sm"
            onClick={() => setShowAuthModal(true)}
            className="text-xs shrink-0 self-start sm:self-auto"
          >
            Kirish / Ro‘yxatdan o‘tish
          </Button>
        </div>
      )}

      {/* Search user card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Yangi do‘st qidirish
          </CardTitle>
        </CardHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Foydalanuvchi nomini yozing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {searchResults.map((u) => (
              <div key={u.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {u.username}
                  </p>
                  <p className="text-xs text-slate-400">
                    Lvl {u.level} • {u.streak} kunlik streak
                  </p>
                </div>

                <div>
                  {u.relationshipStatus === 'FRIEND' ? (
                    <Badge variant="success">Do‘st</Badge>
                  ) : u.relationshipStatus === 'SENT' ? (
                    <Badge variant="warning">So‘rov yuborilgan</Badge>
                  ) : u.relationshipStatus === 'RECEIVED' ? (
                    <Badge variant="info">So‘rov kutmoqda</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendFriendRequest(u.username)}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      Qo‘shish
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Requests Section */}
      {pendingRequests.received.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 text-sm">
              Kelgan do‘stlik so‘rovlari ({pendingRequests.received.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {pendingRequests.received.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {req.sender.username}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Qabul
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondRequest(req.id, 'REJECT')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Friends List & Chat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Friends List */}
        <Card className="p-0 overflow-hidden md:col-span-1">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Do‘stlar ({friends.length})
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {friends.length === 0 ? (
              <p className="text-xs text-center py-10 text-slate-400">
                Hozircha do‘stlar yo‘q. Yangi do‘stlarni qidiring!
              </p>
            ) : (
              friends.map((f) => {
                const isSelected = activeChatFriend?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveChatFriend(f)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                          {f.username.slice(0, 2).toUpperCase()}
                        </div>
                        <Circle
                          className={`w-3 h-3 absolute -bottom-0.5 -right-0.5 rounded-full fill-current ${
                            f.isOnline ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {f.username}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {f.isOnline ? 'Online' : 'Offline'} • Lvl {f.level}
                        </p>
                      </div>
                    </div>

                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right column: Chat Window */}
        <Card className="md:col-span-2 p-0 overflow-hidden flex flex-col h-[500px]">
          {activeChatFriend ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs">
                    {activeChatFriend.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {activeChatFriend.username}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {activeChatFriend.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Game Invitation Dropdown Buttons */}
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInviteToGame('TIC_TAC_TOE')}
                    className="text-xs"
                    title="Tic Tac Toe o‘ynash"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                    TicTacToe
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInviteToGame('CHECKERS')}
                    className="text-xs"
                    title="Shashka o‘ynash"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                    Shashka
                  </Button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
                {messages.length === 0 ? (
                  <p className="text-xs text-center py-16 text-slate-400">
                    Suhbatni birinchi bo‘lib boshlang! 👋
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.receiverId === activeChatFriend.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="break-words">{m.message}</p>
                          <span
                            className={`text-[9px] block text-right mt-0.5 ${
                              isMe ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {formatTimeOnly(m.createdAt)} {isMe && (m.read ? '✓✓' : '✓')}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900"
              >
                <input
                  type="text"
                  placeholder="Xabar yozing..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" isLoading={sendLoading} className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">Suhbatni boshlash uchun do‘stingizni tanlang</p>
              <p className="text-xs mt-1">Do‘stlar ro‘yxatidan istalgan odamni bosing.</p>
            </div>
          )}
        </Card>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
