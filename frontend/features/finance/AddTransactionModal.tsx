'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { Category } from '../../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'EXPENSE' | 'INCOME' | 'SMART';
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'EXPENSE',
}: AddTransactionModalProps) {
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME' | 'SMART'>(defaultType);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [smartText, setSmartText] = useState('');
  const [smartResult, setSmartResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(defaultType);
    setError(null);
    setSmartResult(null);
    setAmount('');
    setTitle('');
    setDescription('');
  }, [defaultType, isOpen]);

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then((res) => {
        if (res.success) setCategories(res.data);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'SMART') {
        if (!smartText.trim()) {
          setError('Matn kiriting');
          setLoading(false);
          return;
        }
        const res = await api.smartParse(smartText);
        setSmartResult(res.data);
        onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        const numAmount = parseFloat(amount.replace(/\s+/g, ''));
        if (isNaN(numAmount) || numAmount <= 0) {
          setError('To‘g‘ri summa kiriting');
          setLoading(false);
          return;
        }
        if (!title.trim()) {
          setError(tab === 'EXPENSE' ? 'Nima olganingizni kiriting' : 'Daromad manbasini kiriting');
          setLoading(false);
          return;
        }

        await api.createTransaction({
          type: tab,
          amount: numAmount,
          title: title.trim(),
          description: description.trim() || null,
          categoryId: categoryId || null,
          date: new Date(date).toISOString(),
        });

        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        tab === 'EXPENSE'
          ? 'Xarajat qo‘shish'
          : tab === 'INCOME'
          ? 'Daromad qo‘shish'
          : 'Aqlli matn orqali kiritish'
      }
    >
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => {
            setTab('EXPENSE');
            setError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tab === 'EXPENSE'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          - Xarajat
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('INCOME');
            setError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            tab === 'INCOME'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          + Daromad
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('SMART');
            setError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            tab === 'SMART'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Aqlli
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {smartResult && (
        <div className="p-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Xarajat saqlandi ✓</span>
          </div>
          <p className="text-xs">
            {smartResult.parsed?.categoryName} ({smartResult.parsed?.icon}):{' '}
            {smartResult.parsed?.amount.toLocaleString()} so‘m
          </p>
          {smartResult.smartResponse && (
            <p className="text-xs font-medium italic text-emerald-700 dark:text-emerald-300 pt-1">
              "{smartResult.smartResponse}"
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'SMART' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Xarajatni erkin matnda yozing
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masalan: bugun burger oldim 35 ming yoki taksi 25 ming"
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-slate-400">
              💡 Tizim "ming", "mln", imlo xatolarini (buger, taxi) va oziq-ovqat, transport kabilarni avtomatik taniydi.
            </p>
          </div>
        ) : (
          <>
            <Input
              label="Summa"
              placeholder="Masalan: 35 000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              label={tab === 'EXPENSE' ? 'Nima oldingiz?' : 'Manba'}
              placeholder={tab === 'EXPENSE' ? 'Masalan: Burger' : 'Masalan: Ish haqi'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Kategoriya
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlanmagan (Boshqa)</option>
                {categories
                  .filter((c) => c.type === tab)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Sana"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              label="Izoh (ixtiyoriy)"
              placeholder="Qo‘shimcha tafsilotlar"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        )}

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Bekor qilish
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
}
