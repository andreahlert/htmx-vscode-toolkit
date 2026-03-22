/** Definition for a known HTMX extension */
export interface HtmxExtension {
  name: string;
  description: string;
  docsUrl: string;
}

/** Known HTMX extensions available for hx-ext */
export const htmxExtensions: HtmxExtension[] = [
  // ── Official extensions (htmx.org) ────────────────────
  {
    name: 'head-support',
    description: 'Merges new head tag contents into the existing document head on swaps',
    docsUrl: 'https://htmx.org/extensions/head-support/',
  },
  {
    name: 'preload',
    description: 'Preloads linked content on mousedown or mouseover for faster navigation',
    docsUrl: 'https://htmx.org/extensions/preload/',
  },
  {
    name: 'response-targets',
    description: 'Allows targeting different elements based on HTTP response status codes',
    docsUrl: 'https://htmx.org/extensions/response-targets/',
  },
  {
    name: 'sse',
    description: 'Provides Server-Sent Events (SSE) support for real-time server push',
    docsUrl: 'https://htmx.org/extensions/sse/',
  },
  {
    name: 'ws',
    description: 'Provides WebSocket support for bidirectional real-time communication',
    docsUrl: 'https://htmx.org/extensions/ws/',
  },
  {
    name: 'idiomorph',
    description: 'Morph swap strategy using idiomorph algorithm for DOM diffing',
    docsUrl: 'https://github.com/bigskysoftware/idiomorph',
  },

  // ── Community extensions (GitHub) ─────────────────────
  {
    name: 'json-enc',
    description: 'Encodes request parameters as JSON instead of URL-encoded format',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/json-enc/README.md',
  },
  {
    name: 'morphdom-swap',
    description: 'Uses the morphdom library to swap content, providing smoother DOM updates',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/morphdom-swap/README.md',
  },
  {
    name: 'alpine-morph',
    description: 'Uses Alpine.js morph plugin for intelligent DOM morphing during swaps',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/alpine-morph/README.md',
  },
  {
    name: 'class-tools',
    description: 'Provides CSS class manipulation utilities with classes and toggle attributes',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/class-tools/README.md',
  },
  {
    name: 'multi-swap',
    description: 'Allows swapping multiple elements from a single response using IDs',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/multi-swap/README.md',
  },
  {
    name: 'path-deps',
    description: 'Enables path-based dependencies between elements for automatic refreshing',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/path-deps/README.md',
  },
  {
    name: 'remove-me',
    description: 'Automatically removes an element after a specified delay',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/remove-me/README.md',
  },
  {
    name: 'restored',
    description: 'Triggers events on elements restored from the history cache',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/restored/README.md',
  },
  {
    name: 'loading-states',
    description: 'Provides CSS class-based loading state management during requests',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/loading-states/README.md',
  },
  {
    name: 'disable-element',
    description: 'Disables an element during an HTMX request (deprecated, use hx-disabled-elt)',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/disable-element/README.md',
  },
  {
    name: 'event-header',
    description: 'Includes the triggering event in the request as a header',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/event-header/README.md',
  },
  {
    name: 'include-vals',
    description: 'Provides a template syntax for including computed values in requests',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/include-vals/README.md',
  },
  {
    name: 'ajax-header',
    description: 'Adds the X-Requested-With: XMLHttpRequest header to requests',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/ajax-header/README.md',
  },
  {
    name: 'debug',
    description: 'Logs all HTMX events to the console for debugging purposes',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/debug/README.md',
  },
  {
    name: 'method-override',
    description: 'Uses the X-HTTP-Method-Override header for PUT/PATCH/DELETE methods',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/method-override/README.md',
  },
  {
    name: 'client-side-templates',
    description: 'Render server responses using client-side template engines (Mustache, Handlebars, Nunjucks)',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/client-side-templates/README.md',
  },
  {
    name: 'path-params',
    description: 'Use parameterized URL paths with values from the DOM',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/path-params/README.md',
  },
  {
    name: 'no-cache',
    description: 'Prevent caching of HTMX requests by adding cache-busting query parameters',
    docsUrl: 'https://github.com/bigskysoftware/htmx-extensions/blob/main/src/no-cache/README.md',
  },
];
