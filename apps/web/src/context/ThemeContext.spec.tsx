import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { theme } = useTheme();
  return <div data-testid="theme-value">{theme}</div>;
}

describe('ThemeContext', () => {
  it('deve renderizar os filhos dentro do ThemeProvider', () => {
    const html = renderToString(
      <ThemeProvider>
        <div data-testid="child">Conteúdo do App</div>
      </ThemeProvider>
    );

    expect(html).toContain('Conteúdo do App');
  });

  it('deve fornecer o tema padrão light para os componentes filhos no SSR', () => {
    const html = renderToString(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(html).toContain('light');
  });

  it('deve lançar erro quando useTheme for utilizado fora do ThemeProvider', () => {
    expect(() => {
      renderToString(<TestConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
