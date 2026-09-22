import { describe, expect, it } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('merges multiple class names cleanly', () => {
    const result = cn('text-sm', 'font-medium', 'text-slate-900');

    expect(result).toBe('text-sm font-medium text-slate-900');
  });

  it('resolves conflicting tailwind class names', () => {
    const result = cn('p-4', 'p-2');

    expect(result).toBe('p-2');
  });

  it('filters out falsy conditions', () => {
    const isHidden = false;
    const result = cn('flex', isHidden && 'hidden', undefined, null, 'items-center');

    expect(result).toBe('flex items-center');
  });
});
