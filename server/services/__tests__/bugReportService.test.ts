import { describe, it, expect, vi } from 'vitest';
import { evaluateBugReport } from '../bugReportService.js';

vi.mock('../deepseek.js', () => ({
  callDeepSeek: vi.fn(),
  isDeepSeekConfigured: false,
}));

describe('bugReportService', () => {
  it('rejects reports with empty or too short title', async () => {
    const res = await evaluateBugReport({
      title: 'hi',
      description: 'Something crashed when I clicked start',
      category: 'Gameplay Bug',
    });
    expect(res.rejected).toBe(true);
    expect(res.reason).toContain('title is too short');
  });

  it('rejects reports with empty or too short description', async () => {
    const res = await evaluateBugReport({
      title: 'Valid Bug Title Here',
      description: 'bad',
      category: 'Gameplay Bug',
    });
    expect(res.rejected).toBe(true);
    expect(res.reason).toContain('description is too short');
  });

  it('rejects reports with excessively long title or description', async () => {
    const longTitleRes = await evaluateBugReport({
      title: 'a'.repeat(250),
      description: 'Something crashed when I clicked start',
      category: 'Gameplay Bug',
    });
    expect(longTitleRes.rejected).toBe(true);

    const longDescRes = await evaluateBugReport({
      title: 'Valid Bug Title Here',
      description: 'a'.repeat(3000),
      category: 'Gameplay Bug',
    });
    expect(longDescRes.rejected).toBe(true);
  });

  it('formats valid bug report cleanly and sanitizes dangerous characters', async () => {
    const res = await evaluateBugReport({
      title: '<script>alert(1)</script>Game Freezes',
      description: 'When playing Connect Four against AI, the board freezes on turn 5.<img src=x onerror=alert(1)>',
      category: 'Gameplay Bug',
      diagnostics: {
        userAgent: 'Mozilla/5.0 Test',
        screenResolution: '1920x1080',
      },
    });

    expect(res.rejected).toBe(false);
    expect(res.formattedTitle).toContain('&lt;script&gt;alert(1)&lt;/script&gt;Game Freezes');
    expect(res.formattedBody).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(res.formattedTitle).toContain('[Gameplay Bug]');
  });

  it('falls back unknown category to Other', async () => {
    const res = await evaluateBugReport({
      title: 'Valid Bug Title Here',
      description: 'Valid description for testing category fallback.',
      category: 'UnknownHackerCategory',
    });

    expect(res.rejected).toBe(false);
    expect(res.formattedTitle).toContain('[Other]');
  });
});
