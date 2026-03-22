import * as vscode from 'vscode';
import {
  getAttributeDefinition,
  validSwapValues,
  htmxAttributes,
} from '../data/attributes';
import { findHtmxAttributes, AttributeOccurrence } from '../utils/htmlParser';
import { isSupportedDocument } from '../utils/languageSupport';

/** All known hx-* attribute names (without the hx- prefix check for hx-on:*) */
const knownAttributeNames = new Set<string>(htmxAttributes.keys());

/**
 * Provides diagnostics (warnings and info) for HTMX attributes.
 * Checks for unknown attributes, invalid values, deprecated usage,
 * and common mistakes.
 */
export class HtmxDiagnosticProvider implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('htmx');

    // Update diagnostics on document open (immediate) and change (debounced)
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((doc) => this.updateDiagnostics(doc)),
      vscode.workspace.onDidChangeTextDocument((e) => this.debouncedUpdate(e.document)),
      vscode.workspace.onDidCloseTextDocument((doc) => {
        this.debounceTimers.delete(doc.uri.toString());
        this.diagnosticCollection.delete(doc.uri);
      }),
    );

    // Process already-open documents
    for (const doc of vscode.workspace.textDocuments) {
      this.updateDiagnostics(doc);
    }
  }

  private debouncedUpdate(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const existing = this.debounceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    this.debounceTimers.set(key, setTimeout(() => {
      this.debounceTimers.delete(key);
      this.updateDiagnostics(document);
    }, 300));
  }

  /**
   * Runs all diagnostic checks on the given document.
   */
  updateDiagnostics(document: vscode.TextDocument): void {
    if (!isSupportedDocument(document)) {
      this.diagnosticCollection.delete(document.uri);
      return;
    }

    const config = vscode.workspace.getConfiguration('htmxIntelliSense');
    if (!config.get<boolean>('enableValidation', true)) {
      this.diagnosticCollection.delete(document.uri);
      return;
    }

    const occurrences = findHtmxAttributes(document);
    if (occurrences.length === 0) {
      this.diagnosticCollection.delete(document.uri);
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    for (const occ of occurrences) {
      // Check unknown attributes
      const unknownDiag = this.checkUnknownAttribute(occ);
      if (unknownDiag) {
        diagnostics.push(unknownDiag);
        continue; // Skip value checks for unknown attributes
      }

      // Check deprecated attributes
      const deprecatedDiag = this.checkDeprecatedAttribute(occ);
      if (deprecatedDiag) {
        diagnostics.push(deprecatedDiag);
      }

      // Check invalid values
      const valueDiags = this.checkAttributeValue(occ);
      diagnostics.push(...valueDiags);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  /**
   * Checks if an hx-* attribute name is recognized.
   */
  private checkUnknownAttribute(occ: AttributeOccurrence): vscode.Diagnostic | undefined {
    const name = occ.name;

    // Known attribute
    if (knownAttributeNames.has(name)) {
      return undefined;
    }

    // hx-on:* is a dynamic pattern
    if (name.startsWith('hx-on:') || name.startsWith('hx-on-')) {
      return undefined;
    }

    // Check for common typos and suggest corrections
    const suggestion = this.findSimilarAttribute(name);
    const message = suggestion
      ? `Unknown HTMX attribute "${name}". Did you mean "${suggestion}"?`
      : `Unknown HTMX attribute "${name}".`;

    const diag = new vscode.Diagnostic(
      occ.nameRange,
      message,
      vscode.DiagnosticSeverity.Warning
    );
    diag.source = 'htmx';
    diag.code = 'unknown-attribute';

    return diag;
  }

  /**
   * Checks if an attribute is deprecated.
   */
  private checkDeprecatedAttribute(occ: AttributeOccurrence): vscode.Diagnostic | undefined {
    const attr = getAttributeDefinition(occ.name);
    if (!attr?.deprecated) {
      return undefined;
    }

    let message = `"${occ.name}" is deprecated.`;
    if (occ.name === 'hx-ws') {
      message += ' Use the WebSocket extension (hx-ext="ws") with ws-connect instead.';
    } else if (occ.name === 'hx-sse') {
      message += ' Use the SSE extension (hx-ext="sse") with sse-connect instead.';
    } else if (occ.name === 'hx-vars') {
      message += ' Use hx-vals instead.';
    }

    const diag = new vscode.Diagnostic(
      occ.nameRange,
      message,
      vscode.DiagnosticSeverity.Hint
    );
    diag.source = 'htmx';
    diag.code = 'deprecated-attribute';
    diag.tags = [vscode.DiagnosticTag.Deprecated];

    return diag;
  }

  /**
   * Validates attribute values for attributes with known value sets.
   */
  private checkAttributeValue(occ: AttributeOccurrence): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    if (!occ.value || !occ.valueRange) {
      return diagnostics;
    }

    switch (occ.name) {
      case 'hx-swap':
        diagnostics.push(...this.validateSwapValue(occ));
        break;
      case 'hx-boost':
        diagnostics.push(...this.validateBooleanValue(occ, 'hx-boost'));
        break;
      case 'hx-push-url':
        diagnostics.push(...this.validatePushUrlValue(occ));
        break;
      case 'hx-replace-url':
        diagnostics.push(...this.validatePushUrlValue(occ));
        break;
      case 'hx-history':
        diagnostics.push(...this.validateHistoryValue(occ));
        break;
    }

    return diagnostics;
  }

  /**
   * Validates hx-swap values.
   */
  private validateSwapValue(occ: AttributeOccurrence): vscode.Diagnostic[] {
    const parts = occ.value.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return [];

    const baseValue = parts[0];
    if (!validSwapValues.has(baseValue)) {
      const validList = Array.from(validSwapValues).join(', ');
      const diag = new vscode.Diagnostic(
        occ.valueRange!,
        `Invalid hx-swap value "${baseValue}". Valid values: ${validList}`,
        vscode.DiagnosticSeverity.Warning
      );
      diag.source = 'htmx';
      diag.code = 'invalid-swap-value';
      return [diag];
    }

    return [];
  }

  /**
   * Validates boolean-like attributes (true/false).
   */
  private validateBooleanValue(occ: AttributeOccurrence, attrName: string): vscode.Diagnostic[] {
    const val = occ.value.trim().toLowerCase();
    if (val !== 'true' && val !== 'false') {
      const diag = new vscode.Diagnostic(
        occ.valueRange!,
        `${attrName} expects "true" or "false", got "${occ.value}".`,
        vscode.DiagnosticSeverity.Warning
      );
      diag.source = 'htmx';
      diag.code = 'invalid-boolean-value';
      return [diag];
    }
    return [];
  }

  /**
   * Validates hx-push-url and hx-replace-url values.
   */
  private validatePushUrlValue(occ: AttributeOccurrence): vscode.Diagnostic[] {
    const val = occ.value.trim();
    // Valid: true, false, or a URL path
    if (val === 'true' || val === 'false' || val.startsWith('/') || val.startsWith('http')) {
      return [];
    }

    // Likely a mistake
    if (val !== '' && val !== 'true' && val !== 'false') {
      const diag = new vscode.Diagnostic(
        occ.valueRange!,
        `${occ.name} expects "true", "false", or a URL path. Got "${val}".`,
        vscode.DiagnosticSeverity.Information
      );
      diag.source = 'htmx';
      diag.code = 'suspicious-url-value';
      return [diag];
    }

    return [];
  }

  /**
   * Validates hx-history values.
   */
  private validateHistoryValue(occ: AttributeOccurrence): vscode.Diagnostic[] {
    const val = occ.value.trim().toLowerCase();
    if (val !== 'false') {
      const diag = new vscode.Diagnostic(
        occ.valueRange!,
        `hx-history only accepts "false" to prevent history caching. Got "${occ.value}".`,
        vscode.DiagnosticSeverity.Warning
      );
      diag.source = 'htmx';
      diag.code = 'invalid-history-value';
      return [diag];
    }
    return [];
  }

  /**
   * Finds the most similar known attribute name using Levenshtein distance.
   */
  private findSimilarAttribute(name: string): string | undefined {
    let bestMatch: string | undefined;
    let bestDistance = Infinity;

    for (const known of knownAttributeNames) {
      const dist = levenshtein(name, known);
      if (dist < bestDistance && dist <= 3) {
        bestDistance = dist;
        bestMatch = known;
      }
    }

    // Also check hx-on pattern
    if (!bestMatch && name.startsWith('hx-on') && !name.includes(':')) {
      return 'hx-on:<event>';
    }

    return bestMatch;
  }

  dispose(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.diagnosticCollection.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}

/**
 * Computes the Levenshtein edit distance between two strings.
 * Uses a two-row rolling array to minimize allocations.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}
