/** Event definition for hx-on:* and hx-trigger completions */
export interface EventDefinition {
  name: string;
  description: string;
}

/** Standard DOM events commonly used with hx-trigger and hx-on:* */
export const domEvents: EventDefinition[] = [
  // Mouse
  { name: 'click', description: 'Fires when a pointing device button is clicked on an element' },
  { name: 'dblclick', description: 'Fires when a pointing device button is double-clicked on an element' },
  { name: 'mousedown', description: 'Fires when a pointing device button is pressed on an element' },
  { name: 'mouseup', description: 'Fires when a pointing device button is released on an element' },
  { name: 'mouseenter', description: 'Fires when a pointing device enters the element boundaries' },
  { name: 'mouseleave', description: 'Fires when a pointing device leaves the element boundaries' },
  { name: 'mouseover', description: 'Fires when a pointing device moves onto an element or its children' },
  { name: 'mouseout', description: 'Fires when a pointing device moves off an element or its children' },
  { name: 'mousemove', description: 'Fires when a pointing device moves while over an element' },
  { name: 'contextmenu', description: 'Fires when the right button of the mouse is clicked' },

  // Keyboard
  { name: 'keydown', description: 'Fires when a key is pressed down' },
  { name: 'keyup', description: 'Fires when a key is released' },
  { name: 'keypress', description: 'Fires when a key that produces a character is pressed (deprecated)' },

  // Focus
  { name: 'focus', description: 'Fires when an element receives focus' },
  { name: 'blur', description: 'Fires when an element loses focus' },
  { name: 'focusin', description: 'Fires when an element is about to receive focus (bubbles)' },
  { name: 'focusout', description: 'Fires when an element is about to lose focus (bubbles)' },

  // Form
  { name: 'submit', description: 'Fires when a form is submitted' },
  { name: 'change', description: 'Fires when the value of an input/select/textarea changes and loses focus' },
  { name: 'input', description: 'Fires immediately when the value of an input/textarea changes' },
  { name: 'reset', description: 'Fires when a form is reset' },
  { name: 'invalid', description: 'Fires when a form element fails validation' },
  { name: 'select', description: 'Fires when text is selected in an input or textarea' },

  // Drag
  { name: 'drag', description: 'Fires when an element is being dragged' },
  { name: 'dragstart', description: 'Fires when the user starts dragging an element' },
  { name: 'dragend', description: 'Fires when a drag operation ends' },
  { name: 'dragover', description: 'Fires when a dragged element is over a valid drop target' },
  { name: 'dragenter', description: 'Fires when a dragged element enters a valid drop target' },
  { name: 'dragleave', description: 'Fires when a dragged element leaves a valid drop target' },
  { name: 'drop', description: 'Fires when a dragged element is dropped on a valid drop target' },

  // Touch
  { name: 'touchstart', description: 'Fires when a touch point is placed on the touch surface' },
  { name: 'touchend', description: 'Fires when a touch point is removed from the touch surface' },
  { name: 'touchmove', description: 'Fires when a touch point is moved along the touch surface' },
  { name: 'touchcancel', description: 'Fires when a touch point has been disrupted' },

  // Scroll & Resize
  { name: 'scroll', description: 'Fires when the document view or an element is scrolled' },
  { name: 'resize', description: 'Fires when the document view has been resized' },

  // Misc
  { name: 'load', description: 'Fires when the element has been loaded' },
  { name: 'error', description: 'Fires when an error occurs during loading' },
];

/** HTMX-specific events used with hx-on:htmx:* (v2 kebab-case naming) */
export const htmxEvents: EventDefinition[] = [
  // Request lifecycle (v2 kebab-case)
  { name: 'htmx:abort', description: 'Sent when an HTMX request is aborted' },
  { name: 'htmx:after-on-load', description: 'Triggered after the response content has been loaded into the DOM' },
  { name: 'htmx:after-process-node', description: 'Triggered after HTMX has initialized a node' },
  { name: 'htmx:after-request', description: 'Triggered after an AJAX request has completed (success or failure)' },
  { name: 'htmx:after-settle', description: 'Triggered after the DOM has settled from a swap' },
  { name: 'htmx:after-swap', description: 'Triggered after new content has been swapped into the DOM' },
  { name: 'htmx:before-cleanup-element', description: 'Triggered before HTMX cleans up an element' },
  { name: 'htmx:before-on-load', description: 'Triggered before the response is loaded' },
  { name: 'htmx:before-process-node', description: 'Triggered before HTMX initializes a node' },
  { name: 'htmx:before-request', description: 'Triggered before an AJAX request is issued. Can be cancelled.' },
  { name: 'htmx:before-send', description: 'Triggered just before the request is sent. Can modify the XHR.' },
  { name: 'htmx:before-swap', description: 'Triggered before the swap step. Can modify swap behavior.' },
  { name: 'htmx:before-transition', description: 'Triggered before a CSS transition' },
  { name: 'htmx:config-request', description: 'Triggered before a request is configured. Allows modification of request parameters, headers, etc.' },
  { name: 'htmx:confirm', description: 'Triggered when a confirmation is needed. Can be used for custom confirm dialogs.' },
  { name: 'htmx:history-cache-error', description: 'Triggered when an error occurs during history cache operations' },
  { name: 'htmx:history-cache-miss', description: 'Triggered on a cache miss during history navigation' },
  { name: 'htmx:history-cache-miss-error', description: 'Triggered when a cache miss results in an error' },
  { name: 'htmx:history-cache-miss-load', description: 'Triggered when a cache miss successfully loads content' },
  { name: 'htmx:history-restore', description: 'Triggered when htmx handles a history restoration action' },
  { name: 'htmx:before-history-save', description: 'Triggered before the content is saved to the history cache' },
  { name: 'htmx:load', description: 'Triggered when new content is added to the DOM' },
  { name: 'htmx:no-sse-source-error', description: 'Triggered when an SSE source cannot be found' },
  { name: 'htmx:oob-after-swap', description: 'Triggered after an out-of-band swap' },
  { name: 'htmx:oob-before-swap', description: 'Triggered before an out-of-band swap' },
  { name: 'htmx:oob-error-no-target', description: 'Triggered when an out-of-band swap cannot find a target element' },
  { name: 'htmx:on-load-error', description: 'Triggered when an error occurs during the onLoad phase' },
  { name: 'htmx:prompt', description: 'Triggered after a prompt is shown to the user' },
  { name: 'htmx:pushed-into-history', description: 'Triggered when a URL is pushed into history' },
  { name: 'htmx:replaced-in-history', description: 'Triggered when a URL is replaced in history' },
  { name: 'htmx:response-error', description: 'Triggered when an HTTP error response is received' },
  { name: 'htmx:send-error', description: 'Triggered when a network error prevents the request' },
  { name: 'htmx:sse-error', description: 'Triggered when an error occurs with an SSE connection' },
  { name: 'htmx:sse-open', description: 'Triggered when an SSE connection is established' },
  { name: 'htmx:swap-error', description: 'Triggered when an error occurs during the swap phase' },
  { name: 'htmx:target-error', description: 'Triggered when an invalid target is specified' },
  { name: 'htmx:timeout', description: 'Triggered when a request times out' },
  { name: 'htmx:validation:validate', description: 'Triggered before element validation, allows custom validation' },
  { name: 'htmx:validation:failed', description: 'Triggered when element validation fails' },
  { name: 'htmx:validation:halted', description: 'Triggered when validation prevents a request from being issued' },
  { name: 'htmx:xhr:abort', description: 'Triggered when an XHR is aborted' },
  { name: 'htmx:xhr:loadend', description: 'Triggered when the XHR finishes loading' },
  { name: 'htmx:xhr:loadstart', description: 'Triggered when the XHR starts loading' },
  { name: 'htmx:xhr:progress', description: 'Triggered periodically during XHR data transfer' },
  { name: 'htmx:trigger', description: 'Triggered when an hx-trigger condition is met' },
  { name: 'htmx:before-history-update', description: 'Triggered before the history is updated' },

  { name: 'htmx:validate-url', description: 'Triggered to validate the URL before a request is sent. Can be cancelled to prevent the request.' },
  { name: 'htmx:history-cache-hit', description: 'Triggered on a cache hit during history navigation' },
];

/** HTMX v1 legacy camelCase event names for backward compatibility */
export const htmxEventsLegacy: EventDefinition[] = [
  { name: 'htmx:afterOnLoad', description: '(v1 compat) Triggered after the response content has been loaded into the DOM' },
  { name: 'htmx:afterProcessNode', description: '(v1 compat) Triggered after HTMX has initialized a node' },
  { name: 'htmx:afterRequest', description: '(v1 compat) Triggered after an AJAX request has completed (success or failure)' },
  { name: 'htmx:afterSettle', description: '(v1 compat) Triggered after the DOM has settled from a swap' },
  { name: 'htmx:afterSwap', description: '(v1 compat) Triggered after new content has been swapped into the DOM' },
  { name: 'htmx:beforeCleanupElement', description: '(v1 compat) Triggered before HTMX cleans up an element' },
  { name: 'htmx:beforeOnLoad', description: '(v1 compat) Triggered before the response is loaded' },
  { name: 'htmx:beforeProcessNode', description: '(v1 compat) Triggered before HTMX initializes a node' },
  { name: 'htmx:beforeRequest', description: '(v1 compat) Triggered before an AJAX request is issued. Can be cancelled.' },
  { name: 'htmx:beforeSend', description: '(v1 compat) Triggered just before the request is sent. Can modify the XHR.' },
  { name: 'htmx:beforeSwap', description: '(v1 compat) Triggered before the swap step. Can modify swap behavior.' },
  { name: 'htmx:beforeTransition', description: '(v1 compat) Triggered before a CSS transition' },
  { name: 'htmx:configRequest', description: '(v1 compat) Triggered before a request is configured. Allows modification of request parameters, headers, etc.' },
  { name: 'htmx:historyCacheError', description: '(v1 compat) Triggered when an error occurs during history cache operations' },
  { name: 'htmx:historyCacheMiss', description: '(v1 compat) Triggered on a cache miss during history navigation' },
  { name: 'htmx:historyCacheMissError', description: '(v1 compat) Triggered when a cache miss results in an error' },
  { name: 'htmx:historyCacheMissLoad', description: '(v1 compat) Triggered when a cache miss successfully loads content' },
  { name: 'htmx:historyRestore', description: '(v1 compat) Triggered when htmx handles a history restoration action' },
  { name: 'htmx:beforeHistorySave', description: '(v1 compat) Triggered before the content is saved to the history cache' },
  { name: 'htmx:noSSESourceError', description: '(v1 compat) Triggered when an SSE source cannot be found' },
  { name: 'htmx:oobAfterSwap', description: '(v1 compat) Triggered after an out-of-band swap' },
  { name: 'htmx:oobBeforeSwap', description: '(v1 compat) Triggered before an out-of-band swap' },
  { name: 'htmx:oobErrorNoTarget', description: '(v1 compat) Triggered when an out-of-band swap cannot find a target element' },
  { name: 'htmx:onLoadError', description: '(v1 compat) Triggered when an error occurs during the onLoad phase' },
  { name: 'htmx:pushedIntoHistory', description: '(v1 compat) Triggered when a URL is pushed into history' },
  { name: 'htmx:replacedInHistory', description: '(v1 compat) Triggered when a URL is replaced in history' },
  { name: 'htmx:responseError', description: '(v1 compat) Triggered when an HTTP error response is received' },
  { name: 'htmx:sendError', description: '(v1 compat) Triggered when a network error prevents the request' },
  { name: 'htmx:sseError', description: '(v1 compat) Triggered when an error occurs with an SSE connection' },
  { name: 'htmx:sseOpen', description: '(v1 compat) Triggered when an SSE connection is established' },
  { name: 'htmx:swapError', description: '(v1 compat) Triggered when an error occurs during the swap phase' },
  { name: 'htmx:targetError', description: '(v1 compat) Triggered when an invalid target is specified' },
  { name: 'htmx:beforeHistoryUpdate', description: '(v1 compat) Triggered before the history is updated' },
  { name: 'htmx:historyCacheHit', description: '(v1 compat) Triggered on a cache hit during history navigation' },
  { name: 'htmx:validateUrl', description: '(v1 compat) Triggered to validate the URL before a request is sent' },
];

/**
 * Returns all event names for hx-on:* completion.
 * DOM events are returned as-is, HTMX events are returned with the htmx: prefix.
 */
export function getAllEventNames(): string[] {
  return [
    ...domEvents.map(e => e.name),
    ...htmxEvents.map(e => e.name),
    ...htmxEventsLegacy.map(e => e.name),
  ];
}
