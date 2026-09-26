'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Skeleton } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { DashboardData } from '../../types';
import { formatCurrency, formatDateUz } from '../../lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { AddTransactionModal } from '../finance/AddTransactionModal';
import { BudgetModal } from '../finance/BudgetModal';

export function DashboardView() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'EXPENSE' | 'INCOME' | 'SMART' | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting and Gamification Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">
            Salom, {user?.username} 👋
          </h2>
          <p className="text-blue-100 text-xs md:text-sm mt-1">
            Moliyaviy strategiyangiz va bugungi balansingiz
          </p>
        </div>

        {/* Level and Streak pill */}
        {user?.stats && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                  Daraja
                </p>
                <p className="text-sm font-bold leading-none">{user.stats.level}-Level</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                  Streak
                </p>
                <p className="text-sm font-bold leading-none">{user.stats.streak} kun</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Finance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Umumiy Balans
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 mt-3" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(data?.balance || 0)}
            </p>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">Barcha tushum va chiqimlar</span>
        </Card>

        {/* Month Income */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Shu oy daromadi
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 mt-3" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              +{formatCurrency(data?.monthIncome || 0)}
            </p>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">Joriy oydagi daromadlar</span>
        </Card>

        {/* Month Expense */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Shu oy xarajati
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 mt-3" />
          ) : (
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
              -{formatCurrency(data?.monthExpense || 0)}
            </p>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">Joriy oydagi xarajatlar</span>
        </Card>

        {/* Today Expense */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugungi xarajat
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 mt-3" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(data?.todayExpense || 0)}
            </p>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">Kun davomida sarflangan</span>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setModalType('EXPENSE')}
          className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 min-w-[140px] shadow-sm"
        >
          <Minus className="w-4 h-4 mr-1.5" />
          Xarajat
        </Button>
        <Button
          onClick={() => setModalType('INCOME')}
          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 min-w-[140px] shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Daromad
        </Button>
        <Button
          onClick={() => setModalType('SMART')}
          variant="secondary"
          className="w-full sm:w-auto text-blue-600 dark:text-blue-400 font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" />
          Aqlli yozish
        </Button>
      </div>

      {/* Budget Summary & Smart Daily Limit Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Oylik Byudjet & Kundalik Limit</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Tejamkorlik va xarajatlarni rejalashtirish
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBudgetModal(true)}
          >
            {data?.budget ? 'O‘zgartirish' : 'Byudjet belgilash'}
          </Button>
        </CardHeader>

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : data?.budget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(data.budget.spent)} / {formatCurrency(data.budget.budgetAmount)}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.budget.percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  data.budget.isExceeded
                    ? 'bg-rose-500'
                    : data.budget.isWarning
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, data.budget.percent)}%` }}
              />
            </div>

            {/* Smart Daily Limit Callout (Section 20) */}
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                  Bugun taxminan {formatCurrency(data.budget.smartDailyLimit)}gacha sarflashingiz mumkin.
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300/80 mt-0.5">
                  Qolgan byudjet: {formatCurrency(data.budget.remaining)} • Oydan qolgan kunlar: {data.budget.remainingDays} kun. (Bu yordamchi hisob-kitobdir)
                </p>
              </div>
            </div>

            {data.budget.isExceeded && (
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>🔴 Oylik byudjet tugadi! Iltimos, xarajatlarni qisqartiring.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">Hali oylik byudjet belgilanmagan.</p>
            <p className="text-xs mt-1">Oylik limit qo‘ysangiz, tizim har kunlik tavsiya etilgan summani hisoblab beradi.</p>
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Oxirgi Tranzaksiyalar</CardTitle>
          <Link
            href="/finance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            Barchasini ko‘rish
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.recentTransactions || data.recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm font-medium">Hozircha hech qanday tranzaksiya qayd etilmagan.</p>
            <p className="text-xs mt-1">+ Xarajat tugmasi orqali birinchi xarajatni qo‘shing!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                    {t.category?.icon || (t.type === 'INCOME' ? '📈' : '💸')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.category?.name || 'Boshqa'} • {formatDateUz(t.date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    t.type === 'INCOME'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {t.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddTransactionModal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        onSuccess={() => {
          loadDashboard();
        }}
        defaultType={modalType || 'EXPENSE'}
      />

      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSuccess={() => {
          loadDashboard();
        }}
        currentAmount={data?.budget?.budgetAmount}
      />
    </div>
  );
}
