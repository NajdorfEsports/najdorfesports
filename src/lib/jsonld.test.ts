import { describe, it, expect } from 'vitest';
import { serializeJsonLd } from './jsonld';

describe('serializeJsonLd', () => {
  it('escapes <, >, & so a </script> value cannot break out of the block', () => {
    const out = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c'); // <
    expect(out).toContain('\\u003e'); // >
  });

  it('escapes ampersands', () => {
    expect(serializeJsonLd({ a: 'x & y' })).toContain('\\u0026');
  });

  it('escapes recursively in nested structures', () => {
    expect(serializeJsonLd({ a: [{ b: '</script>' }] })).not.toContain('</script>');
  });

  it('round-trips back to the original value', () => {
    const value = { '@type': 'Person', name: 'A</script>B & <C>' };
    const decoded = JSON.parse(
      serializeJsonLd(value).replace(/\\u00([0-9a-f]{2})/g, (_, h) =>
        String.fromCharCode(parseInt(h, 16)),
      ),
    );
    expect(decoded).toEqual(value);
  });
});
