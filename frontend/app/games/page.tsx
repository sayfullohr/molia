import React, { Suspense } from 'react';
import { GamesView } from '../../features/games/GamesView';

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-sm text-slate-500">O‘yinlar yuklanmoqda...</p>
        </div>
      }
    >
      <GamesView />
    </Suspense>
  );
}
