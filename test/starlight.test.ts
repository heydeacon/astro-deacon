import type { DeaconIntegration } from '@heydeacon/astro';
import { describe, expect, it } from 'vitest';
import starlightDeacon from '../packages/starlight/src/index.js';
import { scriptsOnEveryPage } from './page.js';

describe('@heydeacon/starlight', () => {
  it('adds the tag from Install to the head of every page', () => {
    const added: DeaconIntegration[] = [];

    starlightDeacon({ key: 'pk_test123' }).hooks['config:setup']({
      addIntegration: (integration) => added.push(integration),
    });

    expect(added.map(scriptsOnEveryPage)).toEqual([
      [{ src: 'https://heydeacon.com/widget/v1/loader.js', 'data-key': 'pk_test123', async: true }],
    ]);
  });

  it('refuses options with no key before Starlight runs', () => {
    // @ts-expect-error -- the key is required
    expect(() => starlightDeacon({})).toThrow(
      new Error(
        '@heydeacon/astro: the "key" option is missing. In Deacon, open Install (the button at ' +
          'the top of the dashboard) and copy the data-key value from the snippet. It starts ' +
          'with pk_.',
      ),
    );
  });
});
