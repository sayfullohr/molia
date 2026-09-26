'use client';

import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        if (password !== confirmPassword) {
          setError('Kiritilgan parollar bir-biriga mos kelmadi');
          setLoading(false);
          return;
        }
        await register(username, password, confirmPassword);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Tizimga kirish' : 'Ro‘yxatdan o‘tish'}
    >
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
            mode === 'login'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Kirish
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
            mode === 'register'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          Ro‘yxatdan o‘tish
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <Input
          label="Foydalanuvchi nomi"
          placeholder="Masalan: JasurDev"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <Input
          label="Parol"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText={
            mode === 'register'
              ? 'Kamida 8 belgi, katta harf, raqam va maxsus belgi'
              : undefined
          }
          required
        />

        {mode === 'register' && (
          <Input
            label="Parolni tasdiqlash"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={loading}>
            {mode === 'login' ? 'Kirish' : 'Ro‘yxatdan o‘tish'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
