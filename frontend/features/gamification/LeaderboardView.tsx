'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge, Skeleton } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { LeaderboardUser } from '../../types';
import { Trophy, Medal, Flame } from 'lucide-react';

export function LeaderboardView() {
  const [filter, setFilter] = useState<'global' | 'friends'>('global');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.getLeaderboard(filter);
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (e) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, [filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Yetakchilar Jadvali (Leaderboard)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Platformada to‘plangan jami tajriba ballari (XP) bo‘yicha reyting
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('global')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'global'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Umumiy (Global)
          </button>
          <button
            onClick={() => setFilter('friends')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'friends'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Faqat Do‘stlar
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-medium">Hozircha foydalanuvchilar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => {
              const isTop3 = u.rank <= 3;
              return (
                <div
                  key={u.userId}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    u.isCurrentUser
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.rank === 1
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/40'
                          : u.rank === 2
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          : u.rank === 3
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'text-slate-400 text-sm'
                      }`}
                    >
                      {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {u.username}
                        </span>
                        {u.isCurrentUser && (
                          <Badge variant="info" className="text-[10px] py-0 px-1.5">
                            Siz
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Level {u.level}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-500 font-medium">
                          <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                          {u.streak} kun streak
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {u.totalXP.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
