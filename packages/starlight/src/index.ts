import type { StarlightPlugin } from '@astrojs/starlight/types';
import deacon from '@heydeacon/astro';
import type { DeaconIntegration, DeaconOptions } from '@heydeacon/astro';

export type { DeaconOptions };

export interface DeaconStarlightPlugin {
  name: string;
  hooks: {
    'config:setup': (params: {
      addIntegration: (integration: DeaconIntegration) => void;
    }) => void;
  };
}

/** Adds the Astro integration, so a Starlight site gets the same tag on every page. */
export default function starlightDeacon(options: DeaconOptions): DeaconStarlightPlugin {
  const integration = deacon(options);

  const plugin: DeaconStarlightPlugin = {
    name: '@heydeacon/starlight',
    hooks: {
      'config:setup'({ addIntegration }) {
        addIntegration(integration);
      },
    },
  };

  return plugin satisfies StarlightPlugin;
}
