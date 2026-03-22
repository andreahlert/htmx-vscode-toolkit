import * as vscode from 'vscode';
import {
  getAttributeDefinition,
  swapModifiers,
  triggerModifiers,
} from '../data/attributes';
import { htmxExtensions } from '../data/extensions';

/**
 * Provides hover documentation for HTMX attributes.
 * When hovering over any hx-* attribute, shows a rich Markdown tooltip
 * with description, valid values, examples, and a link to official docs.
 */
export class HtmxHoverProvider implements vscode.HoverProvider {

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Hover | undefined {
    const config = vscode.workspace.getConfiguration('htmxIntelliSense');
    if (!config.get<boolean>('enableHover', true)) {
      return undefined;
    }

    const range = document.getWordRangeAtPosition(position, /hx-[a-zA-Z0-9_:.-]+/);
    if (!range) {
      return undefined;
    }

    const word = document.getText(range);

    // Check if this is an hx-on: or hx-on-- (JSX) event attribute
    if (word.startsWith('hx-on:') || word.startsWith('hx-on--')) {
      return this.provideHxOnHover(word, range);
    }

    const attr = getAttributeDefinition(word);
    if (!attr) {
      return undefined;
    }

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    // Header
    md.appendMarkdown(`### \`${word}\`\n\n`);

    // Deprecated badge
    if (attr.deprecated) {
      md.appendMarkdown('**⚠ Deprecated**\n\n');
    }

    // Description
    md.appendMarkdown(`${attr.description}\n\n`);

    // Values table
    if (attr.values && attr.values.length > 0) {
      md.appendMarkdown('**Values:**\n\n');
      for (const v of attr.values) {
        md.appendMarkdown(`- \`${v.value}\` ${v.description}\n`);
      }
      md.appendMarkdown('\n');
    }

    // Value hint
    if (attr.valueHint) {
      md.appendMarkdown(`**Accepts:** ${attr.valueHint}\n\n`);
    }

    // Modifiers for hx-swap
    if (word === 'hx-swap') {
      md.appendMarkdown('**Modifiers** (space-separated after the swap strategy):\n\n');
      for (const mod of swapModifiers) {
        md.appendMarkdown(`- \`${mod.value}\` ${mod.description}\n`);
      }
      md.appendMarkdown('\n');
      md.appendMarkdown('**Example:** `hx-swap="innerHTML swap:500ms settle:100ms"`\n\n');
    }

    // Modifiers for hx-trigger
    if (word === 'hx-trigger') {
      md.appendMarkdown('**Modifiers** (space-separated after the event):\n\n');
      for (const mod of triggerModifiers) {
        md.appendMarkdown(`- \`${mod.value}\` ${mod.description}\n`);
      }
      md.appendMarkdown('\n');
      md.appendMarkdown('**Examples:**\n');
      md.appendMarkdown('- `hx-trigger="click"`\n');
      md.appendMarkdown('- `hx-trigger="keyup changed delay:500ms"`\n');
      md.appendMarkdown('- `hx-trigger="every 2s"`\n');
      md.appendMarkdown('- `hx-trigger="intersect once"`\n\n');
    }

    // Extension list for hx-ext
    if (word === 'hx-ext') {
      md.appendMarkdown('**Known extensions:**\n\n');
      for (const ext of htmxExtensions) {
        md.appendMarkdown(`- \`${ext.name}\` ${ext.description}\n`);
      }
      md.appendMarkdown('\n');
    }

    // Examples for common attributes
    const example = this.getExample(word);
    if (example) {
      md.appendMarkdown(`**Example:**\n\n`);
      md.appendCodeblock(example, 'html');
      md.appendMarkdown('\n');
    }

    // Version info
    if (attr.since) {
      md.appendMarkdown(`*Since HTMX ${attr.since}*\n\n`);
    }

    // Docs link
    md.appendMarkdown(`[Official Documentation](${attr.docsUrl})`);

    return new vscode.Hover(md, range);
  }

  /**
   * Provides hover info for hx-on:<event> attributes.
   */
  private provideHxOnHover(word: string, range: vscode.Range): vscode.Hover {
    // Normalize hx-on-- (JSX) to hx-on: for display
    const eventName = word.startsWith('hx-on--')
      ? word.replace('hx-on--', '')
      : word.replace('hx-on:', '');
    const md = new vscode.MarkdownString();
    md.isTrusted = true;

    md.appendMarkdown(`### \`${word}\`\n\n`);
    md.appendMarkdown(`Inline event handler for the \`${eventName}\` event.\n\n`);
    md.appendMarkdown(`The handler receives the event object as \`event\`.\n\n`);

    if (eventName.startsWith('htmx:')) {
      md.appendMarkdown(`This is an HTMX lifecycle event. It fires during HTMX request processing.\n\n`);
    } else {
      md.appendMarkdown(`This is a standard DOM event.\n\n`);
    }

    md.appendMarkdown('**Example:**\n\n');
    md.appendCodeblock(`<button ${word}="alert(event.type)">Click</button>`, 'html');
    md.appendMarkdown('\n');
    md.appendMarkdown('[Official Documentation](https://htmx.org/attributes/hx-on/)');

    return new vscode.Hover(md, range);
  }

  /**
   * Returns an HTML example for the given attribute.
   */
  private getExample(attrName: string): string | undefined {
    const examples: Record<string, string> = {
      'hx-get': '<button hx-get="/api/data" hx-target="#result">Load</button>',
      'hx-post': '<form hx-post="/api/submit" hx-target="#result">\n  <input name="email" />\n  <button>Submit</button>\n</form>',
      'hx-put': '<form hx-put="/api/items/1" hx-target="#item-1">Update</form>',
      'hx-patch': '<button hx-patch="/api/items/1" hx-target="#item-1">Patch</button>',
      'hx-delete': '<button hx-delete="/api/items/1" hx-confirm="Are you sure?">Delete</button>',
      'hx-target': '<div hx-get="/data" hx-target="#results">Load into #results</div>',
      'hx-swap': '<div hx-get="/items" hx-swap="beforeend">Append items</div>',
      'hx-trigger': '<input hx-get="/search" hx-trigger="keyup changed delay:500ms" />',
      'hx-boost': '<nav hx-boost="true">\n  <a href="/page">Boosted link</a>\n</nav>',
      'hx-indicator': '<button hx-get="/slow" hx-indicator="#spinner">Load</button>\n<div id="spinner" class="htmx-indicator">Loading...</div>',
      'hx-confirm': '<button hx-delete="/item/1" hx-confirm="Delete this item?">Delete</button>',
      'hx-include': '<button hx-post="/submit" hx-include="[name=token]">Submit</button>',
      'hx-vals': '<button hx-post="/action" hx-vals=\'{"key": "value"}\'>Go</button>',
      'hx-push-url': '<a hx-get="/page" hx-push-url="true">Navigate</a>',
      'hx-select': '<div hx-get="/page" hx-select="#content">Load partial</div>',
      'hx-ext': '<body hx-ext="json-enc">\n  <form hx-post="/api">...</form>\n</body>',
      'hx-sync': '<input hx-get="/search" hx-trigger="keyup" hx-sync="closest form:abort" />',
      'hx-preserve': '<video id="player" hx-preserve="true">...</video>',
    };

    return examples[attrName];
  }
}
