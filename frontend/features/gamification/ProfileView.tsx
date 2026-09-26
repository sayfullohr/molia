'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { formatDateUz } from '../../lib/utils';
import {
  User,
  Flame,
  Award,
  Gamepad2,
  Trophy,
  CheckCircle2,
  Lock,
  Shield,
  Calendar,
} from 'lucide-react';

export function ProfileView() {
  const { user } = useAuth();
  const stats = user?.stats;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user?.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {user?.username}
              </h2>
              <Badge variant="info">Level {stats?.level || 1}</Badge>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Ro‘yxatdan o‘tgan: {user?.createdAt ? formatDateUz(user.createdAt) : 'Yaqinda'}
            </p>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Moliya ma’lumotlari mutlaqo maxfiy</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        {stats && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{stats.level}-Daraja</span>
              <span>
                {stats.totalXP} / {stats.nextLevelXP} XP ({stats.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Keyingi darajaga o‘tish uchun yana {Math.max(0, stats.nextLevelXP - stats.totalXP)} XP kerak.
            </p>
          </div>
        )}
      </Card>

      {/* Gamification Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1 fill-amber-500" />
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {stats?.streak || 0} kun
          </p>
          <span className="text-xs text-slate-400">Joriy streak</span>
        </Card>

        <Card className="text-center p-4">
          <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {stats?.longestStreak || 0} kun
          </p>
          <span className="text-xs text-slate-400">Eng uzun streak</span>
        </Card>

        <Card className="text-center p-4">
          <Gamepad2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {stats?.gamesPlayedCount || 0} ta
          </p>
          <span className="text-xs text-slate-400">O‘ynalgan o‘yinlar</span>
        </Card>

        <Card className="text-center p-4">
          <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats?.gamesWonCount || 0} ta
          </p>
          <span className="text-xs text-slate-400">G‘alabalar</span>
        </Card>
      </div>

      {/* Achievements Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Yutuqlar & Mukofotlar ({stats?.achievementsCount || 0} / {stats?.totalAchievements || 0})
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stats?.allAchievements?.map((a) => {
            const isUnlocked = a.unlocked;
            return (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {a.name}
                      </h4>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {a.description}
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                      +{a.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
