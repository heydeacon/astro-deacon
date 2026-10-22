# @heydeacon/starlight

Adds the [Deacon](https://heydeacon.com) chat widget to every page of your Starlight docs.

Deacon is an AI support agent that answers questions from your own docs and content, and says when it doesn't know.

You need a Deacon account, and there's a free plan.

## Install

```sh
npm install @heydeacon/starlight
```

## Set it up

Add the plugin to Starlight in `astro.config.mjs` with your key:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightDeacon from '@heydeacon/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      plugins: [starlightDeacon({ key: 'pk_your_widget_key' })],
    }),
  ],
});
```

To find your key, open Install from the button at the top of the Deacon dashboard. The snippet there has it in `data-key`, and it starts with `pk_`. If the key is missing, or an option has the wrong type, the build stops and says why.

Deacon only runs on the sites listed on Install. A listed domain covers its subdomains, so `example.com` covers `docs.example.com`. If your docs live somewhere else, such as `example.netlify.app`, add that address on Install too.

When you run `npm run dev`, Install notices the widget on `localhost:4321` and lets you add it in one click. Chats on localhost don't count towards your plan.

## Options

| Option      | Type    | Default  | What it does |
| ----------- | ------- | -------- | ------------ |
| `key`       | string  | required | Your Deacon key. |
| `context`   | object  | none     | Details about the visitor that Deacon takes into account when it answers, the same on every page, such as `{ docsVersion: '3.2' }` for the version of the docs they're reading. Up to 12 keys, each value a string, number or boolean. Anyone can read them in the page's HTML, so never put a secret here. |
| `pageViews` | boolean | `true`   | The same script counts visits for Deacon's website analytics. Set this to `false` to send no page views or JavaScript errors from your docs. Chat still works. |

```js
starlightDeacon({
  key: 'pk_your_widget_key',
  context: { docsVersion: '3.2' },
  pageViews: false,
});
```

## Opening the chat from your own button

The widget comes with its own button. To use one of yours instead, hide Deacon's in Appearance in the dashboard and call `window.Deacon.open()` from your button or link. `Deacon.close()` and `Deacon.toggle()` work too.

## What it adds

The plugin adds [@heydeacon/astro](https://www.npmjs.com/package/@heydeacon/astro) to your site. A small script in the head of every page adds the same tag Install gives you:

```html
<script src="https://heydeacon.com/widget/v1/loader.js" data-key="pk_your_widget_key" async></script>
```

It loads in the background without holding up the page. Works with Starlight 0.33 and later.

## License

MIT
