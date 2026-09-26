'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Wallet, PieChart, BarChart2 } from 'lucide-react';

export function StatisticsView() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await api.getStatistics(period);
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (e) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [period]);

  const periods = [
    { label: 'Kunlik', value: 'daily' },
    { label: 'Haftalik', value: 'weekly' },
    { label: 'Oylik', value: 'monthly' },
    { label: 'Yillik', value: 'yearly' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Moliyaviy Statistika
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Xarajatlar tahlili va kategoriya taqsimoti
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p.value
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Jami Xarajat
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
              {formatCurrency(stats?.totalExpense || 0)}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Jami Daromad
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              +{formatCurrency(stats?.totalIncome || 0)}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Sof Balans
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <p
              className={`text-2xl font-bold mt-2 ${
                (stats?.balance || 0) >= 0
                  ? 'text-slate-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(stats?.balance || 0)}
            </p>
          )}
        </Card>
      </div>

      {/* Top Spending Category Card */}
      {stats?.topCategory && (
        <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/40 dark:to-slate-900 border-blue-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stats.topCategory.icon}</span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Eng ko‘p xarajat qilingan kategoriya
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {stats.topCategory.name}: {formatCurrency(stats.topCategory.amount)} ({stats.topCategory.percentage}%)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Category Breakdown (Clean visual bars) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            Kategoriyalar bo‘yicha taqsimot
          </CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !stats?.categoryBreakdown || stats.categoryBreakdown.length === 0 ? (
          <p className="text-sm text-center py-6 text-slate-400">
            Ushbu davrda xarajatlar mavjud emas
          </p>
        ) : (
          <div className="space-y-4">
            {stats.categoryBreakdown.map((cat: any) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({cat.count} ta)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-xs text-slate-400 w-9 text-right font-medium">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Timeline Trend (Section 18: Vaqt bo'yicha spending) */}
      {stats?.timeline && stats.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Vaqt bo‘yicha dinamika
            </CardTitle>
          </CardHeader>

          <div className="space-y-2 pt-2">
            {stats.timeline.slice(-7).map((item: any) => (
              <div
                key={item.date}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs sm:text-sm"
              >
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {item.date}
                </span>
                <div className="flex items-center gap-4">
                  {item.income > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatCurrency(item.income)}
                    </span>
                  )}
                  {item.expense > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      -{formatCurrency(item.expense)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
