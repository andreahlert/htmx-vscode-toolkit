import * as vscode from 'vscode';
import {
  htmxAttributes,
  getAllAttributeNames,
  getAttributeDefinition,
  swapModifiers,
  triggerModifiers,
  validSwapValues,
} from '../data/attributes';
import { domEvents, htmxEvents, htmxEventsLegacy } from '../data/events';
import { htmxExtensions } from '../data/extensions';
import { getCursorContext } from '../utils/htmlParser';

/**
 * Provides auto-completion for HTMX attributes (names and values).
 * Handles both attribute name completion (hx-*) and context-aware
 * value completion for attributes like hx-swap, hx-trigger, hx-target, etc.
 */
export class HtmxCompletionProvider implements vscode.CompletionItemProvider {

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] | undefined {
    const config = vscode.workspace.getConfiguration('htmxIntelliSense');
    if (!config.get<boolean>('enableCompletion', true)) {
      return undefined;
    }

    const ctx = getCursorContext(document, position);

    if (!ctx.inTag) {
      return undefined;
    }

    if (ctx.inAttributeName) {
      return this.provideAttributeNameCompletions(ctx.partialAttributeName ?? '');
    }

    if (ctx.inAttributeValue && ctx.attributeName) {
      return this.provideAttributeValueCompletions(ctx.attributeName, ctx.currentValue ?? '');
    }

    return undefined;
  }

  /**
   * Provides completions for hx-* attribute names.
   */
  private provideAttributeNameCompletions(partial: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const attrNames = getAllAttributeNames();

    for (const fullName of attrNames) {
      // Filter by partial match
      if (partial && !fullName.startsWith(partial)) {
        continue;
      }

      const attr = htmxAttributes.get(fullName);
      if (!attr) continue;

      const item = new vscode.CompletionItem(fullName, vscode.CompletionItemKind.Property);

      // Insert the attribute with = and quotes
      if (fullName === 'hx-disable') {
        // Boolean attribute without value
        item.insertText = new vscode.SnippetString(`${fullName}`);
      } else {
        item.insertText = new vscode.SnippetString(`${fullName}="$1"$0`);
      }

      item.documentation = new vscode.MarkdownString(
        `${attr.description}\n\n[HTMX Docs](${attr.docsUrl})`
      );

      item.detail = attr.deprecated ? '(deprecated) HTMX attribute' : 'HTMX attribute';

      if (attr.deprecated) {
        item.tags = [vscode.CompletionItemTag.Deprecated];
      }

      // Sort hx-get, hx-post etc. to the top
      const priority = this.getAttributePriority(fullName);
      item.sortText = priority + fullName;

      // Replace the partial text already typed
      item.filterText = fullName;

      items.push(item);
    }

    // Add hx-on:* dynamic completion
    if (!partial || 'hx-on:'.startsWith(partial) || partial.startsWith('hx-on:')) {
      const onItem = new vscode.CompletionItem('hx-on:', vscode.CompletionItemKind.Property);
      onItem.insertText = new vscode.SnippetString('hx-on:${1|click,submit,change,keyup,load,htmx:before-request,htmx:after-request,htmx:before-swap,htmx:after-swap|}="$2"$0');
      onItem.documentation = new vscode.MarkdownString(
        'Attaches an inline event handler. Use `hx-on:<event-name>` syntax.\n\n' +
        'Supports both DOM events (click, submit) and HTMX events (htmx:beforeRequest).\n\n' +
        '[HTMX Docs](https://htmx.org/attributes/hx-on/)'
      );
      onItem.detail = 'HTMX event handler';
      onItem.sortText = '0ahx-on:';
      items.push(onItem);
    }

    return items;
  }

  /**
   * Provides context-aware value completions for HTMX attributes.
   */
  private provideAttributeValueCompletions(
    attributeName: string,
    currentValue: string
  ): vscode.CompletionItem[] {
    const attr = getAttributeDefinition(attributeName);

    // hx-on:* event name completion
    if (attributeName.startsWith('hx-on:')) {
      return []; // Value is JS code, no completion needed
    }

    // Route to specialized value completers
    switch (attributeName) {
      case 'hx-swap':
        return this.provideSwapCompletions(currentValue);
      case 'hx-trigger':
        return this.provideTriggerCompletions(currentValue);
      case 'hx-target':
        return this.provideTargetCompletions(currentValue);
      case 'hx-ext':
        return this.provideExtensionCompletions(currentValue);
      case 'hx-sync':
        return this.provideSyncCompletions(currentValue);
      case 'hx-params':
        return this.provideParamsCompletions(currentValue);
      case 'hx-disinherit':
        return this.provideDisinheritCompletions(currentValue);
      case 'hx-swap-oob':
        return this.provideSwapOobCompletions();
      default:
        break;
    }

    // Generic value completions from attribute definition
    if (attr?.values) {
      return attr.values.map((v, i) => {
        const item = new vscode.CompletionItem(v.value, vscode.CompletionItemKind.Value);
        item.documentation = new vscode.MarkdownString(v.description);
        item.sortText = String(i).padStart(2, '0');
        return item;
      });
    }

    return [];
  }

  /**
   * Completions for hx-swap values including modifiers.
   */
  private provideSwapCompletions(currentValue: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Check if user already typed a base value and is now adding modifiers
    const parts = currentValue.trim().split(/\s+/);
    const hasBaseValue = parts.length > 0 && validSwapValues.has(parts[0]);

    if (!hasBaseValue || parts.length <= 1) {
      // Provide base swap values
      const swapValues = [
        { value: 'innerHTML', description: 'Replace the inner HTML of the target (default)' },
        { value: 'outerHTML', description: 'Replace the entire target element' },
        { value: 'textContent', description: 'Replace the text content of the target' },
        { value: 'beforebegin', description: 'Insert before the target element' },
        { value: 'afterbegin', description: 'Insert at the beginning of the target' },
        { value: 'beforeend', description: 'Insert at the end of the target' },
        { value: 'afterend', description: 'Insert after the target element' },
        { value: 'delete', description: 'Delete the target element' },
        { value: 'none', description: 'Do not swap (side effects only)' },
      ];

      for (let i = 0; i < swapValues.length; i++) {
        const sv = swapValues[i];
        const item = new vscode.CompletionItem(sv.value, vscode.CompletionItemKind.EnumMember);
        item.documentation = new vscode.MarkdownString(sv.description);
        item.sortText = String(i).padStart(2, '0');
        items.push(item);
      }
    }

    if (hasBaseValue) {
      // Provide modifiers
      for (const mod of swapModifiers) {
        const item = new vscode.CompletionItem(mod.value, vscode.CompletionItemKind.Property);
        item.documentation = new vscode.MarkdownString(mod.description);
        if (mod.value.endsWith(':')) {
          item.insertText = new vscode.SnippetString(`${mod.value}\${1}`);
        }
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Completions for hx-trigger values including events and modifiers.
   */
  private provideTriggerCompletions(currentValue: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const parts = currentValue.split(/\s+/);
    const hasEvent = parts.length > 0 && parts[0].length > 0;

    if (!hasEvent || parts.length <= 1) {
      // Provide event names
      for (const evt of domEvents) {
        const item = new vscode.CompletionItem(evt.name, vscode.CompletionItemKind.Event);
        item.documentation = new vscode.MarkdownString(evt.description);
        item.sortText = '0' + evt.name;
        items.push(item);
      }

      // Special HTMX trigger values
      const specialTriggers = [
        { value: 'load', description: 'Triggered when the element is loaded' },
        { value: 'revealed', description: 'Triggered when the element scrolls into the viewport' },
        { value: 'intersect', description: 'Triggered when the element intersects the viewport' },
        { value: 'every 1s', description: 'Polls at the specified interval' },
      ];

      for (const st of specialTriggers) {
        const existing = items.find(i => i.label === st.value);
        if (!existing) {
          const item = new vscode.CompletionItem(st.value, vscode.CompletionItemKind.Event);
          item.documentation = new vscode.MarkdownString(st.description);
          item.sortText = '1' + st.value;
          items.push(item);
        }
      }
    }

    if (hasEvent) {
      // Provide modifiers
      for (const mod of triggerModifiers) {
        const item = new vscode.CompletionItem(mod.value, vscode.CompletionItemKind.Property);
        item.documentation = new vscode.MarkdownString(mod.description);
        if (mod.value.endsWith(':')) {
          item.insertText = new vscode.SnippetString(`${mod.value}\${1}`);
        }
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Completions for hx-target values.
   */
  private provideTargetCompletions(_currentValue: string): vscode.CompletionItem[] {
    const targets = [
      { value: 'this', description: 'The element that triggered the request', snippet: 'this' },
      { value: 'closest ', description: 'Closest ancestor matching selector (e.g. closest tr)', snippet: 'closest ${1:selector}' },
      { value: 'find ', description: 'First descendant matching selector (e.g. find .result)', snippet: 'find ${1:selector}' },
      { value: 'next', description: 'Next sibling element (optionally with selector)', snippet: 'next' },
      { value: 'previous', description: 'Previous sibling element (optionally with selector)', snippet: 'previous' },
      { value: 'body', description: 'The document body element', snippet: 'body' },
    ];

    return targets.map((t, i) => {
      const item = new vscode.CompletionItem(t.value, vscode.CompletionItemKind.Value);
      item.documentation = new vscode.MarkdownString(t.description);
      item.insertText = new vscode.SnippetString(t.snippet);
      item.sortText = String(i).padStart(2, '0');
      return item;
    });
  }

  /**
   * Completions for hx-ext values (known extensions).
   */
  private provideExtensionCompletions(currentValue: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Check existing extensions to avoid duplicates
    const existing = new Set(currentValue.split(',').map(s => s.trim()));

    for (const ext of htmxExtensions) {
      if (existing.has(ext.name)) continue;

      const item = new vscode.CompletionItem(ext.name, vscode.CompletionItemKind.Module);
      item.documentation = new vscode.MarkdownString(
        `${ext.description}\n\n[Extension Docs](${ext.docsUrl})`
      );
      item.detail = 'HTMX Extension';
      items.push(item);
    }

    return items;
  }

  /**
   * Completions for hx-sync values.
   */
  private provideSyncCompletions(_currentValue: string): vscode.CompletionItem[] {
    const strategies = [
      { value: 'this:drop', description: 'Drop this request if one is already in flight on this element', snippet: 'this:drop' },
      { value: 'this:abort', description: 'Abort the running request on this element and send this one', snippet: 'this:abort' },
      { value: 'this:replace', description: 'Abort the running request on this element and replace it', snippet: 'this:replace' },
      { value: 'this:queue first', description: 'Queue only the first request on this element', snippet: 'this:queue first' },
      { value: 'this:queue last', description: 'Queue only the last request on this element', snippet: 'this:queue last' },
      { value: 'this:queue all', description: 'Queue all requests on this element in order', snippet: 'this:queue all' },
      { value: 'closest form:abort', description: 'Abort running requests on the closest form', snippet: 'closest ${1:form}:abort' },
      { value: 'closest form:drop', description: 'Drop if request is in flight on the closest form', snippet: 'closest ${1:form}:drop' },
      { value: 'closest form:replace', description: 'Replace running request on the closest form', snippet: 'closest ${1:form}:replace' },
    ];

    return strategies.map((s, i) => {
      const item = new vscode.CompletionItem(s.value, vscode.CompletionItemKind.EnumMember);
      item.documentation = new vscode.MarkdownString(s.description);
      item.insertText = new vscode.SnippetString(s.snippet);
      item.sortText = String(i).padStart(2, '0');
      return item;
    });
  }

  /**
   * Completions for hx-params values.
   */
  private provideParamsCompletions(_currentValue: string): vscode.CompletionItem[] {
    const values = [
      { value: '*', description: 'Include all parameters (default)' },
      { value: 'none', description: 'Include no parameters' },
      { value: 'not ', description: 'Exclude specific parameters', snippet: 'not ${1:param1,param2}' },
    ];

    return values.map((v, i) => {
      const item = new vscode.CompletionItem(v.value, vscode.CompletionItemKind.Value);
      item.documentation = new vscode.MarkdownString(v.description);
      if ('snippet' in v && v.snippet) {
        item.insertText = new vscode.SnippetString(v.snippet);
      }
      item.sortText = String(i).padStart(2, '0');
      return item;
    });
  }

  /**
   * Completions for hx-disinherit values.
   */
  private provideDisinheritCompletions(_currentValue: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Wildcard
    const allItem = new vscode.CompletionItem('*', vscode.CompletionItemKind.Value);
    allItem.documentation = new vscode.MarkdownString('Disable inheritance of all hx-* attributes');
    allItem.sortText = '00';
    items.push(allItem);

    // Individual attributes
    for (const name of getAllAttributeNames()) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
      item.documentation = new vscode.MarkdownString(`Disable inheritance of ${name}`);
      items.push(item);
    }

    return items;
  }

  /**
   * Completions for hx-swap-oob values.
   */
  private provideSwapOobCompletions(): vscode.CompletionItem[] {
    const values = [
      { value: 'true', description: 'Swap this element OOB by matching its id' },
      { value: 'innerHTML', description: 'Replace inner HTML of the matching element' },
      { value: 'outerHTML', description: 'Replace the matching element entirely' },
      { value: 'beforebegin', description: 'Insert before the matching element' },
      { value: 'afterbegin', description: 'Insert at the beginning of the matching element' },
      { value: 'beforeend', description: 'Insert at the end of the matching element' },
      { value: 'afterend', description: 'Insert after the matching element' },
      { value: 'delete', description: 'Delete the matching element' },
      { value: 'none', description: 'Do nothing with the matching element' },
    ];

    return values.map((v, i) => {
      const item = new vscode.CompletionItem(v.value, vscode.CompletionItemKind.EnumMember);
      item.documentation = new vscode.MarkdownString(v.description);
      item.sortText = String(i).padStart(2, '0');
      return item;
    });
  }

  /**
   * Returns a sort priority string for attribute names.
   * HTTP verbs get highest priority, then core attributes, then the rest.
   */
  private getAttributePriority(name: string): string {
    const httpVerbs = ['hx-get', 'hx-post', 'hx-put', 'hx-patch', 'hx-delete'];
    const coreAttrs = ['hx-trigger', 'hx-target', 'hx-swap', 'hx-select', 'hx-boost'];

    if (httpVerbs.includes(name)) return '0a';
    if (coreAttrs.includes(name)) return '0b';
    return '0c';
  }
}

/**
 * Provides completions for hx-on: event names.
 * This is a separate provider triggered by the ":" character.
 */
export class HtmxEventCompletionProvider implements vscode.CompletionItemProvider {

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] | undefined {
    // Check if we're typing hx-on:
    const lineText = document.lineAt(position.line).text;
    const textBeforeCursor = lineText.substring(0, position.character);

    const hxOnMatch = textBeforeCursor.match(/hx-on:([a-zA-Z:.]*)$/);
    if (!hxOnMatch) {
      return undefined;
    }

    const partial = hxOnMatch[1];
    const items: vscode.CompletionItem[] = [];

    // DOM events
    for (const evt of domEvents) {
      if (partial && !evt.name.startsWith(partial)) continue;
      const item = new vscode.CompletionItem(
        `hx-on:${evt.name}`,
        vscode.CompletionItemKind.Event
      );
      item.documentation = new vscode.MarkdownString(evt.description);
      item.detail = 'DOM Event';
      item.sortText = '0' + evt.name;
      item.filterText = `hx-on:${evt.name}`;

      // Replace from "hx-on:" onwards
      const startCol = textBeforeCursor.lastIndexOf('hx-on:');
      if (startCol !== -1) {
        item.range = new vscode.Range(
          position.line, startCol,
          position.line, position.character
        );
      }

      item.insertText = new vscode.SnippetString(`hx-on:${evt.name}="$1"$0`);
      items.push(item);
    }

    // HTMX events (v2 kebab-case + v1 legacy camelCase)
    for (const evt of [...htmxEvents, ...htmxEventsLegacy]) {
      if (partial && !evt.name.startsWith(partial) && !evt.name.replace('htmx:', '').startsWith(partial)) continue;
      const item = new vscode.CompletionItem(
        `hx-on:${evt.name}`,
        vscode.CompletionItemKind.Event
      );
      item.documentation = new vscode.MarkdownString(evt.description);
      item.detail = 'HTMX Event';
      item.sortText = '1' + evt.name;
      item.filterText = `hx-on:${evt.name}`;

      const startCol = textBeforeCursor.lastIndexOf('hx-on:');
      if (startCol !== -1) {
        item.range = new vscode.Range(
          position.line, startCol,
          position.line, position.character
        );
      }

      item.insertText = new vscode.SnippetString(`hx-on:${evt.name}="$1"$0`);
      items.push(item);
    }

    return items;
  }
}
