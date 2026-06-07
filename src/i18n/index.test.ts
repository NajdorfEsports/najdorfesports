import { describe, it, expect } from 'vitest';
import { useT, getLocale, pathFor, unlocalizedPath } from './index';

describe('useT', () => {
  it('returns the requested locale dict and falls back to en', () => {
    expect(useT('zh-TW').nav.home).not.toBe(useT('en').nav.home);
    expect(useT(undefined)).toBe(useT('en'));
    expect(useT('xx')).toBe(useT('en'));
  });
});

describe('getLocale', () => {
  it('reads currentLocale with an en fallback', () => {
    expect(getLocale({ currentLocale: 'zh-CN' })).toBe('zh-CN');
    expect(getLocale({})).toBe('en');
  });
});

describe('pathFor', () => {
  it('keeps the default locale prefix-less and prefixes the others', () => {
    expect(pathFor('en', '/roster/')).toBe('/roster/');
    expect(pathFor('zh-TW', '/roster/')).toBe('/zh-TW/roster/');
    expect(pathFor('zh-TW', '/')).toBe('/zh-TW/');
    expect(pathFor('zh-CN', 'roster/')).toBe('/zh-CN/roster/');
  });
});

describe('unlocalizedPath', () => {
  it('strips a locale prefix and is idempotent for default-locale paths', () => {
    expect(unlocalizedPath('/zh-TW/roster/')).toBe('/roster/');
    expect(unlocalizedPath('/zh-CN/')).toBe('/');
    expect(unlocalizedPath('/zh-CN')).toBe('/');
    expect(unlocalizedPath('/roster/')).toBe('/roster/');
  });
});
