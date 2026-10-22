import { describe, expect, it } from 'vitest';
import deacon from '../packages/astro/src/index.js';
import { scriptsOnEveryPage } from './page.js';

describe('@heydeacon/astro', () => {
  it('adds the tag from Install to the head of every page', () => {
    expect(scriptsOnEveryPage(deacon({ key: 'pk_test123' }))).toEqual([
      { src: 'https://heydeacon.com/widget/v1/loader.js', 'data-key': 'pk_test123', async: true },
    ]);
  });

  it('trims spaces pasted around the key', () => {
    const [script] = scriptsOnEveryPage(deacon({ key: '  pk_test123\n' }));

    expect(script?.['data-key']).toBe('pk_test123');
  });

  it('passes context to Deacon as the data-context attribute', () => {
    const integration = deacon({
      key: 'pk_test123',
      context: { site: 'docs', version: '3.2', beta: true },
    });

    expect(scriptsOnEveryPage(integration)).toEqual([
      {
        src: 'https://heydeacon.com/widget/v1/loader.js',
        'data-key': 'pk_test123',
        'data-context': '{"site":"docs","version":"3.2","beta":true}',
        async: true,
      },
    ]);
  });

  it('keeps a context value that looks like a closing script tag inside the script', () => {
    const integration = deacon({ key: 'pk_test123', context: { note: '</script><b>hi</b>' } });

    expect(scriptsOnEveryPage(integration)[0]?.['data-context']).toBe(
      '{"note":"</script><b>hi</b>"}',
    );
  });

  it.each([
    ['a string', 'plan=pro'],
    ['an array', ['docs']],
    ['an object with a nested value', { plan: { tier: 'pro' } }],
    ['an object with a null value', { plan: null }],
  ])('refuses a context that is %s', (_case, context) => {
    // @ts-expect-error -- a plain JavaScript config can pass any of these
    expect(() => deacon({ key: 'pk_test123', context })).toThrow(
      new Error(
        '@heydeacon/astro: the "context" option must be an object whose values are strings, ' +
          'numbers or booleans.',
      ),
    );
  });

  it('holds back page views with the data-no-page-views attribute', () => {
    expect(scriptsOnEveryPage(deacon({ key: 'pk_test123', pageViews: false }))).toEqual([
      {
        src: 'https://heydeacon.com/widget/v1/loader.js',
        'data-key': 'pk_test123',
        'data-no-page-views': '',
        async: true,
      },
    ]);
  });

  it('refuses a pageViews that is not true or false', () => {
    // @ts-expect-error -- a plain JavaScript config can pass a string
    expect(() => deacon({ key: 'pk_test123', pageViews: 'false' })).toThrow(
      new Error('@heydeacon/astro: the "pageViews" option must be true or false.'),
    );
  });

  const missingKey = new Error(
    '@heydeacon/astro: the "key" option is missing. In Deacon, open Install (the button at the ' +
      'top of the dashboard) and copy the data-key value from the snippet. It starts with pk_.',
  );

  it('refuses options with no key, as a plain JavaScript config can pass', () => {
    // @ts-expect-error -- the key is required
    expect(() => deacon({})).toThrow(missingKey);
  });

  it.each([
    ['empty, as from an unset environment variable', ''],
    ['blank', '   '],
  ])('refuses a key that is %s', (_case, key) => {
    expect(() => deacon({ key })).toThrow(missingKey);
  });
});
