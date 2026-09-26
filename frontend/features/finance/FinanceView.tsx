'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatDateUz } from '../../lib/utils';
import {
  Search,
  Filter,
  Plus,
  Minus,
  Download,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { AddTransactionModal } from './AddTransactionModal';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth/AuthModal';

export function FinanceView() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [modalType, setModalType] = useState<'EXPENSE' | 'INCOME' | 'SMART' | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [editCategory, setEditCategory] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        sortBy,
        sortOrder,
        limit: '100',
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedType) params.type = selectedType;

      const [txRes, catRes] = await Promise.all([
        api.getTransactions(params),
        api.getCategories(),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data.items);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedType, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteTransaction(deletingId);
      setDeletingId(null);
      loadData();
    } catch (e) {
      // Ignore
    }
  };

  const handleEditOpen = (t: Transaction) => {
    setEditingTransaction(t);
    setEditTitle(t.title);
    setEditAmount(t.amount.toString());
    setEditType(t.type);
    setEditCategory(t.categoryId || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      await api.updateTransaction(editingTransaction.id, {
        title: editTitle.trim(),
        amount: parseFloat(editAmount),
        type: editType,
        categoryId: editCategory || null,
      });
      setEditingTransaction(null);
      loadData();
    } catch (e) {
      // Ignore
    }
  };

  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  const handleExportExcel = () => {
    window.open('/api/export/excel', '_blank');
  };

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const dateLabel = formatDateUz(t.date);
    if (!groupedTransactions[dateLabel]) {
      groupedTransactions[dateLabel] = [];
    }
    groupedTransactions[dateLabel].push(t);
  }

  return (
    <div className="space-y-6">
      {/* Header bar with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Moliya & Tranzaksiyalar
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha daromad va xarajatlaringiz tarixi
          </p>
        </div>

        {/* 2 buttons (Xarajat va Daromad) - 50% each */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-72 md:w-80">
          <Button
            className="w-full bg-rose-600 hover:bg-rose-700 h-11 font-semibold text-sm shadow-sm"
            onClick={() => (user ? setModalType('EXPENSE') : setShowAuthModal(true))}
          >
            <Minus className="w-4 h-4 mr-1.5" />
            Xarajat
          </Button>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-semibold text-sm shadow-sm"
            onClick={() => (user ? setModalType('INCOME') : setShowAuthModal(true))}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Daromad
          </Button>
        </div>
      </div>

      {!user && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
            Shaxsiy daromad va xarajatlaringizni qayd etish hamda saqlash uchun tizimga kiring.
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

      {/* Search and Filters Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Debounced Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Qidirish (masalan: Burger)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Barcha turlar</option>
            <option value="EXPENSE">Faqat xarajatlar</option>
            <option value="INCOME">Faqat daromadlar</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Eng yangi birinchi</option>
            <option value="date-asc">Eng eski birinchi</option>
            <option value="amount-desc">Eng katta summa</option>
            <option value="amount-asc">Eng kichik summa</option>
          </select>
        </div>

        {/* Data export bar */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 gap-2">
          <span>Ma’lumotlarni yuklab olish:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              title="CSV formatida yuklab olish"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              title="Excel formatida yuklab olish"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </button>
          </div>
        </div>
      </Card>

      {/* Grouped Transactions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <Card className="text-center py-12 text-slate-400">
          <p className="text-base font-semibold">Tranzaksiya topilmadi</p>
          <p className="text-xs mt-1">Filtrlarni o‘zgartiring yoki yangi xarajat qo‘shing.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                {dateLabel}
              </h3>

              <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                        {t.category?.icon || (t.type === 'INCOME' ? '📈' : '💸')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {t.category?.name || 'Boshqa'}
                          {t.description && ` • ${t.description}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
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

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditOpen(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        onSuccess={() => loadData()}
        defaultType={modalType || 'EXPENSE'}
      />

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          title="Tranzaksiyani tahrirlash"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Nom / Sabab"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Input
              label="Summa (so‘m)"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Kategoriya
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlanmagan (Boshqa)</option>
                {categories
                  .filter((c) => c.type === editType)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTransaction(null)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button type="submit" className="flex-1">
                Saqlash
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal (Section 16: Delete oldidan confirmation) */}
      {deletingId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          title="Tranzaksiyani o‘chirish"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Haqiqatan ham ushbu tranzaksiyani o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.</span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="flex-1"
              >
                Yo‘q, qoldirish
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
              >
                Ha, o‘chirilsin
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
