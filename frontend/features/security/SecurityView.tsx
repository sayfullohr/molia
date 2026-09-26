'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Skeleton } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { LoginAttemptItem, ActiveSessionItem } from '../../types';
import { formatDateUz } from '../../lib/utils';
import { ShieldCheck, Monitor, Smartphone, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export function SecurityView() {
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([]);
  const [history, setHistory] = useState<LoginAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [sessRes, histRes] = await Promise.all([
        api.getActiveSessions(),
        api.getLoginHistory(),
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (histRes.success) setHistory(histRes.data);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleRevokeSession = async (id: string) => {
    try {
      await api.revokeSession(id);
      loadSecurityData();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
          Xavfsizlik & Monitoring
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Faol sessiyalar, kirishlar tarixi va hisobingiz xavfsizlik nazorati
        </p>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Xavfsizlik kafolati</p>
          <p className="mt-0.5 text-emerald-700 dark:text-emerald-300/80">
            Parol va maxfiy ma’lumotlar kuchli shifrlash (bcrypt) bilan himoyalangan. Parollar hech qachon ochiq ko‘rinishda saqlanmaydi va frontendga berilmaydi.
          </p>
        </div>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            Faol Qurilmalar va Sessiyalar
          </CardTitle>
        </CardHeader>

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : sessions.length === 0 ? (
          <p className="text-xs text-center py-6 text-slate-400">Faol sessiyalar topilmadi</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map((s) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {s.deviceInfo || 'Kompyuter / Noma’lum'}
                    </p>
                    <p className="text-xs text-slate-400">
                      IP: {s.ipAddress} • {formatDateUz(s.createdAt)} da kirilgan
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevokeSession(s.id)}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Bekor qilish
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Login History Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Kirish Urinishlari Tarixi (Security Audit Log)
          </CardTitle>
        </CardHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-center py-8 text-slate-400">Kirish tarixi mavjud emas</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  {h.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.username}
                      </span>
                      <Badge variant={h.success ? 'success' : 'danger'} className="text-[10px] py-0">
                        {h.success ? 'Muvaffaqiyatli' : 'Muvaffaqiyatsiz'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {h.deviceInfo} • IP: {h.ipAddress}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 shrink-0">
                  {formatDateUz(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
