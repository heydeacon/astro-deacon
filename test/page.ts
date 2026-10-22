import { JSDOM } from 'jsdom';
import type { DeaconIntegration } from '../packages/astro/src/index.js';

/**
 * Builds a page the way Astro does with the integration's head scripts, and returns the
 * attributes of each script tag they added. Code injected at any other stage isn't in the
 * page. jsdom loads none of the tags, and it doesn't reflect `async` into an attribute as
 * browsers do, so that one is read from the property.
 */
export function scriptsOnEveryPage(
  integration: DeaconIntegration,
): Record<string, string | boolean>[] {
  const head: string[] = [];

  integration.hooks['astro:config:setup']({
    injectScript: (stage, code) => {
      if (stage === 'head-inline') {
        head.push(`<script>${code}</script>`);
      }
    },
  });

  const page = new JSDOM(`<!doctype html><html><head>${head.join('')}</head></html>`, {
    runScripts: 'dangerously',
  });

  return [...page.window.document.head.querySelectorAll<HTMLScriptElement>('script[src]')].map(
    (script) => ({
      ...Object.fromEntries([...script.attributes].map(({ name, value }) => [name, value])),
      async: script.async,
    }),
  );
}
