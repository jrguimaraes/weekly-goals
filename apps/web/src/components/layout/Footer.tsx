import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500">
          Weekly Goals &mdash; Sistema de Planejamento e Acompanhamento Semanal de Metas
        </p>
        <p className="text-xs text-slate-400">
          MVP Operacional
        </p>
      </div>
    </footer>
  );
}
