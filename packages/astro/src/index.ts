import type { AstroIntegration, HookParameters } from 'astro';

export interface DeaconOptions {
  /** Your Deacon key: the `data-key` value in the snippet on Install. */
  key: string;
  /**
   * Details about the visitor that Deacon takes into account when it answers, the same on
   * every page, such as which version of the docs they're reading. Up to 12 keys, each value
   * a string, number or boolean. Every value is readable in the page, so never put a secret
   * here.
   */
  context?: Record<string, string | number | boolean>;
  /**
   * Set to false to send Deacon no page views or JavaScript errors from these pages. Chat
   * and goals still work.
   * @default true
   */
  pageViews?: boolean;
}

export interface DeaconIntegration {
  name: string;
  hooks: {
    'astro:config:setup': (
      params: Pick<HookParameters<'astro:config:setup'>, 'injectScript'>,
    ) => void;
  };
}

const LOADER_SRC = 'https://heydeacon.com/widget/v1/loader.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isContext(value: unknown): value is Record<string, string | number | boolean> {
  return isRecord(value) && Object.values(value).every(isScalar);
}

/** The options from the site's config file, which may be plain JavaScript, checked. */
function parseOptions(options: unknown): DeaconOptions {
  const given = isRecord(options) ? options : {};
  const key = typeof given.key === 'string' ? given.key.trim() : '';

  if (key === '') {
    throw new Error(
      '@heydeacon/astro: the "key" option is missing. In Deacon, open Install (the button at ' +
        'the top of the dashboard) and copy the data-key value from the snippet. It starts ' +
        'with pk_.',
    );
  }

  const { context, pageViews } = given;

  if (pageViews !== undefined && typeof pageViews !== 'boolean') {
    throw new Error('@heydeacon/astro: the "pageViews" option must be true or false.');
  }

  if (context !== undefined && !isContext(context)) {
    throw new Error(
      '@heydeacon/astro: the "context" option must be an object whose values are strings, ' +
        'numbers or booleans.',
    );
  }

  return {
    key,
    ...(context === undefined ? {} : { context }),
    ...(pageViews === undefined ? {} : { pageViews }),
  };
}

/** A string as a JavaScript literal that can't end the inline script it sits in. */
function literal(value: string): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

/**
 * Install's snippet for tools that take JavaScript rather than HTML. Astro's head scripts are
 * one of those: the code adds the tag, and the loader finds its own tag by its address.
 */
function snippet(attributes: Record<string, string>): string {
  const setAttributes = Object.entries(attributes)
    .map(([name, value]) => `s.setAttribute(${literal(name)},${literal(value)});`)
    .join('');

  return (
    `(function(){var s=document.createElement('script');s.src=${literal(LOADER_SRC)};` +
    `s.async=true;${setAttributes}document.head.appendChild(s);})();`
  );
}

export default function deacon(options: DeaconOptions): DeaconIntegration {
  const { key, context, pageViews } = parseOptions(options);
  const code = snippet({
    'data-key': key,
    ...(context === undefined ? {} : { 'data-context': JSON.stringify(context) }),
    ...(pageViews === false ? { 'data-no-page-views': '' } : {}),
  });

  const integration: DeaconIntegration = {
    name: '@heydeacon/astro',
    hooks: {
      'astro:config:setup'({ injectScript }) {
        injectScript('head-inline', code);
      },
    },
  };

  return integration satisfies AstroIntegration;
}
