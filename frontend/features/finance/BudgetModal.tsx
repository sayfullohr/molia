'use client';

import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAmount?: number;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  currentAmount = 0,
}: BudgetModalProps) {
  const [amount, setAmount] = useState(() => (currentAmount > 0 ? currentAmount.toString() : ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const now = new Date();
    const num = parseFloat(amount.replace(/\s+/g, ''));

    if (isNaN(num) || num <= 0) {
      setError('To‘g‘ri summa kiriting');
      setLoading(false);
      return;
    }

    try {
      await api.setBudget({
        amount: num,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Oylik byudjet belgilash">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Oylik xarajat limiti (so‘m)"
          placeholder="Masalan: 2 000 000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          helperText="Byudjet belgilangach, har kungi tavsiya etilgan xarajat limiti avtomatik hisoblanadi."
          required
        />

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
