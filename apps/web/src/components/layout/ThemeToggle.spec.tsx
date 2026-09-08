import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider, ThemeContext } from '../../context/ThemeContext';

describe('ThemeToggle', () => {
  it('deve renderizar botão com aria-label de alternar para modo escuro no tema light padrão', () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(html).toContain('aria-label="Alternar para modo escuro"');
    expect(html).toContain('title="Alternar para modo escuro"');
    // Verifica a presença do ícone da lua (moon icon SVG)
    expect(html).toContain('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z');
  });

  it('deve renderizar botão com aria-label de alternar para modo claro no tema dark', () => {
    const html = renderToString(
      <ThemeContext.Provider
        value={{
          theme: 'dark',
          toggleTheme: vi.fn(),
          setTheme: vi.fn(),
        }}
      >
        <ThemeToggle />
      </ThemeContext.Provider>
    );

    expect(html).toContain('aria-label="Alternar para modo claro"');
    expect(html).toContain('title="Alternar para modo claro"');
    // Verifica a presença do ícone de sol (sun icon SVG)
    expect(html).toContain('text-amber-400');
    expect(html).toContain('circle cx="12" cy="12" r="4"');
  });

  it('deve possuir classes de acessibilidade e foco apropriadas', () => {
    const html = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(html).toContain('focus:ring-indigo-500');
    expect(html).toContain('focus:ring-2');
  });
});
