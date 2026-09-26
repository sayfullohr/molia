'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DashboardView } from '../features/dashboard/DashboardView';
import { AuthModal } from '../features/auth/AuthModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Wallet, Gamepad2, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <DashboardView />;
  }

  return (
    <div className="py-12 space-y-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-900/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Shaxsiy Moliya & Ijtimoiy Ekotizim</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Xarajatlaringizni aqlli boshqaring, do‘stlar bilan{' '}
          <span className="text-blue-600 dark:text-blue-400">bellashing</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Moliya Strategy — o‘zbek tilidagi aqlli matn tahlili, oylik byudjet nazorati, multiplayer o‘yinlar (TicTacToe, Quiz, Shashka) va do‘stlar bilan muloqotni birlashtirgan professional platforma.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Button
            size="lg"
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
            className="shadow-md shadow-blue-500/25 px-8"
          >
            Ro‘yxatdan o‘tish
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            className="px-8"
          >
            Kirish
          </Button>
        </div>
      </div>

      {/* 3 Pillar Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Shaxsiy Moliya & Byudjet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Oddiy xarajat kiritish, aqlli o‘zbekcha matn tahlili ("burger 35 ming"), oylik limit va har kunlik tavsiya etilgan xarajat hisobi.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Do‘stlar & Real Chat
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Do‘stlarni qidirish, so‘rov yuborish, shaxsiy muloqot va o‘yinga taklif qilish. Moliyaviy ma’lumotlaringiz doimo maxfiy saqlanadi.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Multiplayer O‘yinlar & XP
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            TicTacToe, Moliyaviy Quiz va Shashka bellashuvlari. Har bir g‘alaba va faollik uchun XP ballari, daraja oshishi va yutuqlar.
          </p>
        </Card>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
