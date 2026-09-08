'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '../../lib/api-client';
import { ThemeToggle } from './ThemeToggle';
import type { HealthCheckResponse } from '../../types/api';

const navItems = [
  { href: '/', label: 'Início' },
  { href: '/categories', label: 'Categorias' },
  { href: '/weeks', label: 'Planejamento Semanal' },
  { href: '/history', label: 'Histórico' },
];

export function Navbar() {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const data = await apiClient.get<HealthCheckResponse>('/health');
        if (isMounted) {
          setApiStatus(data.status === 'ok' ? 'online' : 'offline');
        }
      } catch {
        if (isMounted) {
          setApiStatus('offline');
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 2v20" />
                <path d="m17 5-5-3-5 3" />
                <path d="m17 19-5 3-5-3" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-tight dark:text-slate-100">
                Weekly Goals
              </span>
              <span className="text-xs text-slate-500 font-medium dark:text-slate-400">
                Planejamento Semanal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
            title={
              apiStatus === 'online'
                ? 'Backend conectado e operacional'
                : apiStatus === 'offline'
                ? 'Backend indisponível'
                : 'Verificando conexão...'
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : apiStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-slate-600 dark:text-slate-300">
              API {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : '...'}
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>

      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-1 dark:border-slate-800">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
