# Changelog

## 0.2.1 (2026-03-22)

### Bug Fixes

- Fix debounce timer leak on extension deactivation (dispose clears pending timers)
- Fix hx-sync test assertions to match updated completion labels (this:drop, this:abort)
- Remove fabricated htmx:send-abort event (duplicate of htmx:abort)
- Add hover support for hx-on-- JSX variant (e.g. hx-on--click)
- Add missing htmx-1-compat extension to extensions data

## 0.2.0 (2026-03-22)

### Bug Fixes

- Fix diagnostics firing on hx-* attributes inside HTML comments, script, and style content
- Fix valueRange calculation using quote position instead of fragile indexOf
- Fix isInScriptOrStyle suppressing completions after any script tag in the document
- Remove incorrect hx-history-elt deprecation and wrong migration guidance
- Fix hx-preserve completion to insert ="true" instead of bare boolean attribute
- Fix infinite scroll and file upload snippets generating invalid HTML ids with # prefix
- Fix hx-on: completion using camelCase event names (silently broken in htmx v2)
- Fix hx-sync completions to include required element selector prefix (this:abort, closest form:drop)
- Remove ignoreTitle from swap modifiers (not a valid hx-swap modifier)
- Fix 18 broken extension documentation URLs (migrated to GitHub htmx-extensions repo)

### New Features

- Add missing attributes: hx-inherit, hx-vars (deprecated), hx-request
- Add missing htmx events: trigger, before-history-update, send-abort, validate-url, history-cache-hit
- Add deprecation message for hx-vars suggesting hx-vals
- Add snippet registrations for Razor, Jade, and Pug languages

### Performance

- Add 300ms debounce to diagnostic provider (avoids regex scan on every keystroke)
- Optimize Levenshtein distance to use two-row rolling array
- Add language filter to diagnostic provider via isSupportedDocument (skips non-HTML files)

## 0.1.0 (2024-01-01)

### Features

- Attribute name completion for all ~30 hx-* attributes
- Context-aware value completion for hx-swap, hx-trigger, hx-target, hx-ext, hx-sync, hx-params, hx-disinherit, and more
- hx-on:* event name completion with DOM and HTMX lifecycle events
- Hover documentation with descriptions, valid values, examples, and links to official docs
- Diagnostics: unknown attribute detection with typo suggestions (Levenshtein distance)
- Diagnostics: invalid value warnings for hx-swap, hx-boost, hx-push-url, hx-history
- Diagnostics: deprecated attribute hints (hx-ws, hx-sse)
- 23 ready-to-use snippets for common HTMX patterns
- Multi-language support: HTML, PHP, Blade, Django, Jinja2, Go templates, Templ, Astro, JSX, TSX, Svelte, Vue, ERB, Twig, Handlebars, EJS, Nunjucks, Razor, Pug, Jade
