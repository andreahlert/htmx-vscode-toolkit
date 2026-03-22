import * as vscode from 'vscode';

/** Definition of a single HTMX attribute */
export interface HtmxAttribute {
  /** Attribute name without the hx- prefix (e.g. "get", "post") */
  name: string;
  /** Human-readable description pulled from HTMX docs */
  description: string;
  /** Enumerated valid values, if applicable */
  values?: HtmxAttributeValue[];
  /** Free-form hint shown when no enum values apply */
  valueHint?: string;
  /** URL to official HTMX documentation */
  docsUrl: string;
  /** Whether this attribute is deprecated */
  deprecated?: boolean;
  /** HTMX version this attribute was introduced */
  since?: string;
  /** Whether this attribute accepts modifiers (like hx-swap, hx-trigger) */
  hasModifiers?: boolean;
}

export interface HtmxAttributeValue {
  value: string;
  description: string;
}

/**
 * Comprehensive map of all HTMX attributes keyed by their full name (hx-*).
 * Descriptions and behavior sourced from https://htmx.org/reference/
 */
export const htmxAttributes: Map<string, HtmxAttribute> = new Map([
  // ── HTTP verbs ──────────────────────────────────────────
  ['hx-get', {
    name: 'get',
    description: 'Issues a GET request to the given URL. The response will be used to replace or swap content in the DOM based on the hx-target and hx-swap attributes.',
    valueHint: 'URL path (e.g. /api/items)',
    docsUrl: 'https://htmx.org/attributes/hx-get/',
    since: '1.0.0',
  }],
  ['hx-post', {
    name: 'post',
    description: 'Issues a POST request to the given URL. Typically used for form submissions or actions that create resources. Input values within the element are included in the request.',
    valueHint: 'URL path (e.g. /api/items)',
    docsUrl: 'https://htmx.org/attributes/hx-post/',
    since: '1.0.0',
  }],
  ['hx-put', {
    name: 'put',
    description: 'Issues a PUT request to the given URL. Used for updating existing resources. Input values within the element are included in the request.',
    valueHint: 'URL path (e.g. /api/items/1)',
    docsUrl: 'https://htmx.org/attributes/hx-put/',
    since: '1.0.0',
  }],
  ['hx-patch', {
    name: 'patch',
    description: 'Issues a PATCH request to the given URL. Used for partial updates to existing resources. Input values within the element are included in the request.',
    valueHint: 'URL path (e.g. /api/items/1)',
    docsUrl: 'https://htmx.org/attributes/hx-patch/',
    since: '1.0.0',
  }],
  ['hx-delete', {
    name: 'delete',
    description: 'Issues a DELETE request to the given URL. Used for deleting resources. Be cautious as this triggers destructive operations.',
    valueHint: 'URL path (e.g. /api/items/1)',
    docsUrl: 'https://htmx.org/attributes/hx-delete/',
    since: '1.0.0',
  }],

  // ── Core attributes ─────────────────────────────────────
  ['hx-trigger', {
    name: 'trigger',
    description: 'Specifies the event that triggers the request. Defaults to "click" for most elements and "change" for inputs/selects/textareas. Supports event filters, modifiers like once, changed, delay, throttle, and polling with "every".',
    values: [
      { value: 'click', description: 'Triggered on mouse click (default for most elements)' },
      { value: 'submit', description: 'Triggered on form submission' },
      { value: 'change', description: 'Triggered when input value changes (default for inputs)' },
      { value: 'keyup', description: 'Triggered on key release' },
      { value: 'keydown', description: 'Triggered on key press' },
      { value: 'input', description: 'Triggered on every input change (real-time)' },
      { value: 'load', description: 'Triggered when the element is loaded into the DOM' },
      { value: 'revealed', description: 'Triggered when the element scrolls into the viewport' },
      { value: 'intersect', description: 'Triggered when the element intersects the viewport (uses IntersectionObserver)' },
      { value: 'every 1s', description: 'Polls every specified interval (e.g. every 2s, every 500ms)' },
    ],
    valueHint: 'event[,event2,...] [modifiers]',
    docsUrl: 'https://htmx.org/attributes/hx-trigger/',
    since: '1.0.0',
    hasModifiers: true,
  }],
  ['hx-target', {
    name: 'target',
    description: 'Specifies the target element to be swapped. Takes a CSS selector, or the special values "this", "closest <selector>", "find <selector>", "next", "previous", or "body".',
    values: [
      { value: 'this', description: 'The element that triggered the request' },
      { value: 'closest ', description: 'The closest ancestor matching the given CSS selector (e.g. closest tr)' },
      { value: 'find ', description: 'The first descendant matching the given CSS selector (e.g. find .result)' },
      { value: 'next', description: 'The next sibling element, optionally with a selector (e.g. next .panel)' },
      { value: 'previous', description: 'The previous sibling element, optionally with a selector' },
      { value: 'body', description: 'The document body element' },
    ],
    valueHint: 'CSS selector or special keyword',
    docsUrl: 'https://htmx.org/attributes/hx-target/',
    since: '1.0.0',
  }],
  ['hx-swap', {
    name: 'swap',
    description: 'Controls how the response content is swapped into the DOM relative to the target element. Defaults to "innerHTML". Supports modifiers for timing, scrolling, and transitions.',
    values: [
      { value: 'innerHTML', description: 'Replace the inner HTML of the target element (default)' },
      { value: 'outerHTML', description: 'Replace the entire target element with the response' },
      { value: 'textContent', description: 'Replace the text content of the target element' },
      { value: 'beforebegin', description: 'Insert the response before the target element' },
      { value: 'afterbegin', description: 'Insert the response at the beginning of the target element' },
      { value: 'beforeend', description: 'Insert the response at the end of the target element' },
      { value: 'afterend', description: 'Insert the response after the target element' },
      { value: 'delete', description: 'Delete the target element regardless of the response' },
      { value: 'none', description: 'Do not swap the response into the DOM (useful for side effects)' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-swap/',
    since: '1.0.0',
    hasModifiers: true,
  }],
  ['hx-select', {
    name: 'select',
    description: 'Selects a subset of the server response to swap in, using a CSS selector. Only the matching content from the response will be used for the swap.',
    valueHint: 'CSS selector (e.g. #content, .results)',
    docsUrl: 'https://htmx.org/attributes/hx-select/',
    since: '1.0.0',
  }],
  ['hx-select-oob', {
    name: 'select-oob',
    description: 'Selects content from the server response to swap in via an out-of-band swap. Allows updating multiple parts of the page from a single response.',
    valueHint: 'CSS selector with optional swap strategy (e.g. #info:outerHTML)',
    docsUrl: 'https://htmx.org/attributes/hx-select-oob/',
    since: '1.4.0',
  }],
  ['hx-swap-oob', {
    name: 'swap-oob',
    description: 'Marks content for an out-of-band swap. Content with this attribute in a response will be swapped into the matching element in the DOM, regardless of the target.',
    values: [
      { value: 'true', description: 'Swap this element out-of-band by matching its id' },
      { value: 'innerHTML', description: 'Replace the inner HTML of the matching element' },
      { value: 'outerHTML', description: 'Replace the matching element entirely' },
      { value: 'beforebegin', description: 'Insert before the matching element' },
      { value: 'afterbegin', description: 'Insert at the beginning of the matching element' },
      { value: 'beforeend', description: 'Insert at the end of the matching element' },
      { value: 'afterend', description: 'Insert after the matching element' },
      { value: 'delete', description: 'Delete the matching element' },
      { value: 'none', description: 'Do nothing with the matching element' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-swap-oob/',
    since: '1.0.0',
  }],

  // ── Navigation ──────────────────────────────────────────
  ['hx-boost', {
    name: 'boost',
    description: 'Progressively enhances anchors and forms to use AJAX requests instead of full page loads. Links will issue GET requests, forms will issue requests matching their method attribute.',
    values: [
      { value: 'true', description: 'Enable boosting for this element and its children' },
      { value: 'false', description: 'Disable boosting (useful to opt-out within a boosted parent)' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-boost/',
    since: '1.0.0',
  }],
  ['hx-push-url', {
    name: 'push-url',
    description: 'Pushes the request URL (or a custom URL) into the browser history stack, creating a new history entry. Enables back-button navigation for HTMX requests.',
    values: [
      { value: 'true', description: 'Push the request URL into the browser location bar' },
      { value: 'false', description: 'Do not push the URL (default)' },
    ],
    valueHint: 'true, false, or a custom URL path',
    docsUrl: 'https://htmx.org/attributes/hx-push-url/',
    since: '1.0.0',
  }],
  ['hx-replace-url', {
    name: 'replace-url',
    description: 'Replaces the current URL in the browser location bar without creating a new history entry. The back button will not navigate to the previous URL.',
    values: [
      { value: 'true', description: 'Replace the current URL with the request URL' },
      { value: 'false', description: 'Do not replace the URL (default)' },
    ],
    valueHint: 'true, false, or a custom URL path',
    docsUrl: 'https://htmx.org/attributes/hx-replace-url/',
    since: '1.7.0',
  }],

  // ── Request modifiers ───────────────────────────────────
  ['hx-include', {
    name: 'include',
    description: 'Includes additional element values in the AJAX request. Takes a CSS selector to identify elements whose values should be included.',
    valueHint: 'CSS selector (e.g. [name=csrf], #extra-fields, closest form)',
    docsUrl: 'https://htmx.org/attributes/hx-include/',
    since: '1.0.0',
  }],
  ['hx-vals', {
    name: 'vals',
    description: 'Adds additional values to the request parameters. Accepts a JSON string or a JavaScript expression prefixed with "js:". Values are merged with any existing input values.',
    valueHint: 'JSON object (e.g. {"key": "value"}) or js:expression',
    docsUrl: 'https://htmx.org/attributes/hx-vals/',
    since: '1.0.0',
  }],
  ['hx-vars', {
    name: 'vars',
    description: '(Deprecated) Adds values dynamically to the parameters submitted with the request. Use hx-vals instead.',
    valueHint: 'JavaScript expression returning an Object',
    docsUrl: 'https://htmx.org/attributes/hx-vars/',
    since: '1.0.0',
    deprecated: true,
  }],
  ['hx-params', {
    name: 'params',
    description: 'Filters the parameters submitted with a request. Can include all, none, or exclude specific parameter names.',
    values: [
      { value: '*', description: 'Include all parameters (default)' },
      { value: 'none', description: 'Include no parameters' },
      { value: 'not ', description: 'Exclude specific parameters (e.g. not field1,field2)' },
    ],
    valueHint: '*, none, not <param-list>, or comma-separated parameter names',
    docsUrl: 'https://htmx.org/attributes/hx-params/',
    since: '1.0.0',
  }],
  ['hx-headers', {
    name: 'headers',
    description: 'Adds custom HTTP headers to the AJAX request. Accepts a JSON object of header name/value pairs.',
    valueHint: 'JSON object (e.g. {"X-Custom-Header": "value"})',
    docsUrl: 'https://htmx.org/attributes/hx-headers/',
    since: '1.0.0',
  }],
  ['hx-encoding', {
    name: 'encoding',
    description: 'Changes the request encoding type. By default HTMX sends requests with application/x-www-form-urlencoded encoding. Set to multipart/form-data for file uploads.',
    values: [
      { value: 'multipart/form-data', description: 'Use multipart encoding (required for file uploads)' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-encoding/',
    since: '1.0.0',
  }],

  // ── UX attributes ──────────────────────────────────────
  ['hx-confirm', {
    name: 'confirm',
    description: 'Shows a browser confirm() dialog before issuing the request. The request is only sent if the user clicks "OK". Useful for destructive actions.',
    valueHint: 'Confirmation message text (e.g. "Are you sure?")',
    docsUrl: 'https://htmx.org/attributes/hx-confirm/',
    since: '1.0.0',
  }],
  ['hx-disable', {
    name: 'disable',
    description: 'Disables HTMX processing on this element and all its children. Useful for parts of the page that should not have HTMX behavior.',
    docsUrl: 'https://htmx.org/attributes/hx-disable/',
    since: '1.0.0',
  }],
  ['hx-disabled-elt', {
    name: 'disabled-elt',
    description: 'Specifies elements to disable during the request. The disabled attribute is added while the request is in flight and removed when it completes.',
    values: [
      { value: 'this', description: 'Disable the element that triggered the request' },
      { value: 'closest ', description: 'Disable the closest ancestor matching the selector' },
      { value: 'find ', description: 'Disable the first descendant matching the selector' },
      { value: 'next', description: 'Disable the next sibling element' },
      { value: 'previous', description: 'Disable the previous sibling element' },
    ],
    valueHint: 'CSS selector or special keyword',
    docsUrl: 'https://htmx.org/attributes/hx-disabled-elt/',
    since: '1.9.0',
  }],
  ['hx-indicator', {
    name: 'indicator',
    description: 'Specifies the element to apply the htmx-request class to during a request. This class can be used to show a loading indicator. Defaults to the element itself.',
    valueHint: 'CSS selector for the indicator element (e.g. #spinner, .loading)',
    docsUrl: 'https://htmx.org/attributes/hx-indicator/',
    since: '1.0.0',
  }],
  ['hx-prompt', {
    name: 'prompt',
    description: 'Shows a browser prompt() dialog before issuing the request. The user-entered value is sent with the request in the HX-Prompt header.',
    valueHint: 'Prompt message text',
    docsUrl: 'https://htmx.org/attributes/hx-prompt/',
    since: '1.0.0',
  }],

  // ── Inheritance & behavior ──────────────────────────────
  ['hx-disinherit', {
    name: 'disinherit',
    description: 'Controls attribute inheritance for child elements. By default, many hx-* attributes are inherited by child elements. Use this to prevent specific attributes from being inherited.',
    values: [
      { value: '*', description: 'Disable inheritance of all hx-* attributes' },
    ],
    valueHint: '* or space-separated attribute names (e.g. hx-target hx-swap)',
    docsUrl: 'https://htmx.org/attributes/hx-disinherit/',
    since: '1.6.0',
  }],
  ['hx-inherit', {
    name: 'inherit',
    description: 'Explicitly enables attribute inheritance for child elements. When automatic inheritance is disabled, use this to re-enable inheritance for specific attributes.',
    values: [
      { value: '*', description: 'Enable inheritance of all hx-* attributes' },
    ],
    valueHint: '* or space-separated attribute names (e.g. hx-target hx-swap)',
    docsUrl: 'https://htmx.org/attributes/hx-inherit/',
  }],
  ['hx-ext', {
    name: 'ext',
    description: 'Enables one or more HTMX extensions on an element and its children. Extensions add additional behavior to HTMX. Use "ignore:" prefix to disable an inherited extension.',
    valueHint: 'Extension name(s), comma-separated',
    docsUrl: 'https://htmx.org/attributes/hx-ext/',
    since: '1.0.0',
  }],
  ['hx-preserve', {
    name: 'preserve',
    description: 'Preserves an element during the swap process. The element will not be replaced even if it appears in the response content. Requires the element to have an id attribute.',
    values: [
      { value: 'true', description: 'Preserve this element during swaps' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-preserve/',
    since: '1.0.0',
  }],

  // ── Sync & history ─────────────────────────────────────
  ['hx-sync', {
    name: 'sync',
    description: 'Synchronizes AJAX requests between elements. Prevents race conditions by controlling how requests from this element interact with requests from other elements.',
    values: [
      { value: 'drop', description: 'Drop this request if an existing request is in flight' },
      { value: 'abort', description: 'Abort the existing request and send this one' },
      { value: 'replace', description: 'Abort the existing request and replace it with this one' },
      { value: 'queue first', description: 'Queue the first request to arrive' },
      { value: 'queue last', description: 'Queue the last request to arrive (drop earlier queued)' },
      { value: 'queue all', description: 'Queue all requests in order' },
    ],
    valueHint: 'CSS selector:strategy',
    docsUrl: 'https://htmx.org/attributes/hx-sync/',
    since: '1.3.0',
  }],
  ['hx-history', {
    name: 'history',
    description: 'Prevents a page from being saved to the history cache. Set to "false" on pages with sensitive data that should not be stored in the browser history.',
    values: [
      { value: 'false', description: 'Prevent this page from being saved to the history cache' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-history/',
    since: '1.8.0',
  }],
  ['hx-history-elt', {
    name: 'history-elt',
    description: 'Specifies the element to snapshot and restore when navigating history. By default the body is used. This allows you to use a smaller element for history snapshots.',
    docsUrl: 'https://htmx.org/attributes/hx-history-elt/',
    since: '1.0.0',
  }],

  // ── Request configuration ──────────────────────────────
  ['hx-request', {
    name: 'request',
    description: 'Configures aspects of the AJAX request. Accepts a JSON-like string with properties: timeout (ms), credentials (boolean), noHeaders (boolean).',
    valueHint: 'JSON object (e.g. {"timeout": 3000, "credentials": true})',
    docsUrl: 'https://htmx.org/attributes/hx-request/',
    since: '1.4.0',
  }],

  // ── Validation ─────────────────────────────────────────
  ['hx-validate', {
    name: 'validate',
    description: 'Forces validation of form elements before a request is issued. When set to "true", HTML5 form validation will be performed.',
    values: [
      { value: 'true', description: 'Validate form inputs before issuing the request' },
    ],
    docsUrl: 'https://htmx.org/attributes/hx-validate/',
    since: '1.0.0',
  }],

  // ── WebSocket & SSE ────────────────────────────────────
  ['hx-ws', {
    name: 'ws',
    description: 'Establishes a WebSocket connection or sends messages over an existing WebSocket connection. Use "connect:" to open a connection, and "send" to send messages.',
    values: [
      { value: 'connect:', description: 'Establish a WebSocket connection to the given URL' },
      { value: 'send', description: 'Send a message to the nearest WebSocket connection' },
    ],
    valueHint: 'connect:<url> or send',
    docsUrl: 'https://htmx.org/attributes/hx-ws/',
    since: '1.0.0',
    deprecated: true,
  }],
  ['hx-sse', {
    name: 'sse',
    description: 'Establishes a Server-Sent Events (SSE) connection or subscribes to events. Use "connect:" to open a connection, and "swap:" to specify which event triggers a swap.',
    values: [
      { value: 'connect:', description: 'Establish an SSE connection to the given URL' },
      { value: 'swap:', description: 'Swap content when the named event is received' },
    ],
    valueHint: 'connect:<url> or swap:<event-name>',
    docsUrl: 'https://htmx.org/attributes/hx-sse/',
    since: '1.0.0',
    deprecated: true,
  }],

  // ── hx-on (dynamic event handler) ─────────────────────
  ['hx-on', {
    name: 'on',
    description: 'Attaches an inline event handler to an element. Use the hx-on:<event-name> syntax (e.g. hx-on:click, hx-on:htmx:beforeRequest). The handler receives the event as the "event" variable.',
    valueHint: 'JavaScript expression',
    docsUrl: 'https://htmx.org/attributes/hx-on/',
    since: '1.9.3',
  }],
]);

/** Valid hx-swap base values (without modifiers) */
export const validSwapValues = new Set([
  'innerHTML',
  'outerHTML',
  'textContent',
  'beforebegin',
  'afterbegin',
  'beforeend',
  'afterend',
  'delete',
  'none',
]);

/** Modifiers for hx-swap */
export const swapModifiers: HtmxAttributeValue[] = [
  { value: 'swap:', description: 'Timing for the swap step (e.g. swap:500ms)' },
  { value: 'settle:', description: 'Timing for the settle step (e.g. settle:500ms)' },
  { value: 'transition:', description: 'Enable view transitions (transition:true)' },
  { value: 'scroll:', description: 'Scroll target into view (scroll:top or scroll:bottom)' },
  { value: 'show:', description: 'Show target in viewport (show:top or show:bottom)' },
  { value: 'focus-scroll:', description: 'Control focus scroll behavior (focus-scroll:true or focus-scroll:false)' },
];

/** Modifiers for hx-trigger */
export const triggerModifiers: HtmxAttributeValue[] = [
  { value: 'once', description: 'Only trigger this event once' },
  { value: 'changed', description: 'Only trigger if the value has changed' },
  { value: 'delay:', description: 'Delay before issuing the request (e.g. delay:500ms)' },
  { value: 'throttle:', description: 'Throttle requests to at most once per interval (e.g. throttle:500ms)' },
  { value: 'from:', description: 'Listen for the event on another element (CSS selector or document/window)' },
  { value: 'target:', description: 'Only trigger when the event target matches the selector' },
  { value: 'consume', description: 'Consume the event (prevent it from propagating)' },
  { value: 'queue:', description: 'Queue strategy: first, last, all, none' },
];

/**
 * Returns the HtmxAttribute definition for a given attribute name.
 * Handles both "hx-get" style and "hx-on:click" style attributes.
 */
export function getAttributeDefinition(attrName: string): HtmxAttribute | undefined {
  // Direct lookup
  const direct = htmxAttributes.get(attrName);
  if (direct) {
    return direct;
  }

  // Handle hx-on:* pattern
  if (attrName.startsWith('hx-on:') || attrName.startsWith('hx-on-')) {
    return htmxAttributes.get('hx-on');
  }

  return undefined;
}

/**
 * Returns all known HTMX attribute names.
 */
export function getAllAttributeNames(): string[] {
  return Array.from(htmxAttributes.keys());
}
