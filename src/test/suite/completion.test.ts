import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('HTMX Completion Provider', () => {
    const fixturesPath = path.resolve(__dirname, '../../../test-fixtures');

    suiteSetup(async () => {
        // Open the HTML fixture and wait for extension to activate
        const htmlUri = vscode.Uri.file(path.join(fixturesPath, 'test.html'));
        const doc = await vscode.workspace.openTextDocument(htmlUri);
        await vscode.window.showTextDocument(doc);
        // Wait for extension activation
        await sleep(2000);
    });

    // Helper to trigger completion at a specific position in a temporary document
    async function getCompletionsAt(content: string, line: number, character: number, lang: string = 'html'): Promise<vscode.CompletionList> {
        const doc = await vscode.workspace.openTextDocument({ content, language: lang });
        await vscode.window.showTextDocument(doc);
        await sleep(500);

        const position = new vscode.Position(line, character);

        return await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            doc.uri,
            position
        );
    }

    function getLabels(completions: vscode.CompletionList): string[] {
        return completions.items.map(i => typeof i.label === 'string' ? i.label : i.label.label);
    }

    test('provides hx-* attribute name completions inside an HTML tag', async () => {
        // Cursor right after "hx-" in an open tag
        const completions = await getCompletionsAt('<div hx-></div>', 0, 8);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide completions');
        assert.ok(labels.some(l => l.includes('hx-get')), 'Should include hx-get');
        assert.ok(labels.some(l => l.includes('hx-post')), 'Should include hx-post');
        assert.ok(labels.some(l => l.includes('hx-target')), 'Should include hx-target');
        assert.ok(labels.some(l => l.includes('hx-swap')), 'Should include hx-swap');
        assert.ok(labels.some(l => l.includes('hx-trigger')), 'Should include hx-trigger');
    });

    test('provides hx-swap value completions', async () => {
        // Cursor inside the quotes of hx-swap=""
        const completions = await getCompletionsAt('<div hx-swap=""></div>', 0, 14);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide swap value completions');
        assert.ok(labels.includes('innerHTML'), 'Should include innerHTML');
        assert.ok(labels.includes('outerHTML'), 'Should include outerHTML');
        assert.ok(labels.includes('beforebegin'), 'Should include beforebegin');
        assert.ok(labels.includes('afterend'), 'Should include afterend');
        assert.ok(labels.includes('delete'), 'Should include delete');
        assert.ok(labels.includes('none'), 'Should include none');
    });

    test('provides hx-trigger event completions', async () => {
        const completions = await getCompletionsAt('<div hx-trigger=""></div>', 0, 17);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide trigger completions');
        assert.ok(labels.includes('click'), 'Should include click');
        assert.ok(labels.includes('submit'), 'Should include submit');
        assert.ok(labels.includes('change'), 'Should include change');
        assert.ok(labels.includes('load'), 'Should include load');
        assert.ok(labels.includes('revealed'), 'Should include revealed');
    });

    test('provides hx-target value completions', async () => {
        const completions = await getCompletionsAt('<div hx-target=""></div>', 0, 16);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide target completions');
        assert.ok(labels.some(l => l.includes('this')), 'Should include this');
        assert.ok(labels.some(l => l.includes('closest')), 'Should include closest');
        assert.ok(labels.some(l => l.includes('find')), 'Should include find');
        assert.ok(labels.some(l => l.includes('body')), 'Should include body');
    });

    test('provides hx-ext extension name completions', async () => {
        const completions = await getCompletionsAt('<div hx-ext=""></div>', 0, 13);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide extension completions');
        assert.ok(labels.includes('json-enc'), 'Should include json-enc');
        assert.ok(labels.includes('sse'), 'Should include sse');
        assert.ok(labels.includes('ws'), 'Should include ws');
        assert.ok(labels.includes('preload'), 'Should include preload');
    });

    test('provides hx-sync strategy completions', async () => {
        const completions = await getCompletionsAt('<div hx-sync=""></div>', 0, 14);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide sync completions');
        assert.ok(labels.some(l => l.includes('this:drop')), 'Should include this:drop');
        assert.ok(labels.some(l => l.includes('this:abort')), 'Should include this:abort');
        assert.ok(labels.some(l => l.includes('this:replace')), 'Should include this:replace');
    });

    test('provides hx-params value completions', async () => {
        const completions = await getCompletionsAt('<div hx-params=""></div>', 0, 16);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide params completions');
        assert.ok(labels.includes('*'), 'Should include *');
        assert.ok(labels.includes('none'), 'Should include none');
    });

    test('provides hx-boost boolean completions', async () => {
        const completions = await getCompletionsAt('<div hx-boost=""></div>', 0, 15);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide boolean completions');
        assert.ok(labels.includes('true'), 'Should include true');
        assert.ok(labels.includes('false'), 'Should include false');
    });

    test('provides fewer hx- completions outside of HTML tags than inside', async () => {
        // Outside a tag, our completion provider should not contribute.
        // VS Code snippet provider may still provide some hx- items, but
        // there should be significantly fewer completions than inside a tag.
        const outsideCompletions = await getCompletionsAt('some text hx-', 0, 13);
        const insideCompletions = await getCompletionsAt('<div hx-></div>', 0, 8);
        const outsideLabels = getLabels(outsideCompletions).filter(l => l.startsWith('hx-'));
        const insideLabels = getLabels(insideCompletions).filter(l => l.startsWith('hx-'));
        // Inside a tag, our provider adds many more completions (with Property kind)
        const insidePropertyItems = insideCompletions.items.filter(i => {
            const label = typeof i.label === 'string' ? i.label : i.label.label;
            return label.startsWith('hx-') && i.kind === vscode.CompletionItemKind.Property;
        });
        assert.ok(
            insidePropertyItems.length > outsideLabels.length,
            `Inside tag should have more Property-kind hx- completions (${insidePropertyItems.length}) than outside (${outsideLabels.length})`
        );
    });

    test('does NOT provide Property-kind hx- completions inside script tags', async () => {
        const content = '<script>\nvar x = "hx-";\n</script>';
        const completions = await getCompletionsAt(content, 1, 13);
        // Our provider returns CompletionItemKind.Property, while snippets use Snippet kind
        const propertyItems = completions.items.filter(i => {
            const label = typeof i.label === 'string' ? i.label : i.label.label;
            return label.startsWith('hx-') && i.kind === vscode.CompletionItemKind.Property;
        });
        assert.strictEqual(propertyItems.length, 0, 'Should not provide Property completions inside script tags');
    });

    test('does NOT provide Property-kind hx- completions inside HTML comments', async () => {
        const completions = await getCompletionsAt('<!-- <div hx-></div> -->', 0, 13);
        // Our provider returns CompletionItemKind.Property
        const propertyItems = completions.items.filter(i => {
            const label = typeof i.label === 'string' ? i.label : i.label.label;
            return label.startsWith('hx-') && i.kind === vscode.CompletionItemKind.Property;
        });
        assert.strictEqual(propertyItems.length, 0, 'Should not provide Property completions inside comments');
    });

    test('provides completions with documentation', async () => {
        const completions = await getCompletionsAt('<div hx-></div>', 0, 8);
        const hxGet = completions.items.find(i => {
            const label = typeof i.label === 'string' ? i.label : i.label.label;
            return label === 'hx-get';
        });
        assert.ok(hxGet, 'Should find hx-get completion');
        assert.ok(hxGet!.documentation, 'hx-get should have documentation');
    });

    test('provides hx-swap modifier completions after base value', async () => {
        // After typing "innerHTML " the provider should offer modifiers
        const completions = await getCompletionsAt('<div hx-swap="innerHTML "></div>', 0, 24);
        const labels = getLabels(completions);
        assert.ok(completions.items.length > 0, 'Should provide modifier completions');
        assert.ok(labels.some(l => l.includes('swap:')), 'Should include swap: modifier');
        assert.ok(labels.some(l => l.includes('settle:')), 'Should include settle: modifier');
        assert.ok(labels.some(l => l.includes('scroll:')), 'Should include scroll: modifier');
    });

    test('marks deprecated attributes', async () => {
        const completions = await getCompletionsAt('<div hx-></div>', 0, 8);
        const hxWs = completions.items.find(i => {
            const label = typeof i.label === 'string' ? i.label : i.label.label;
            return label === 'hx-ws';
        });
        if (hxWs) {
            assert.ok(
                hxWs.tags?.includes(vscode.CompletionItemTag.Deprecated),
                'hx-ws should be marked deprecated'
            );
        }
    });

    test('provides all HTTP verb completions', async () => {
        const completions = await getCompletionsAt('<div hx-></div>', 0, 8);
        const labels = getLabels(completions);
        assert.ok(labels.some(l => l === 'hx-get'), 'Should include hx-get');
        assert.ok(labels.some(l => l === 'hx-post'), 'Should include hx-post');
        assert.ok(labels.some(l => l === 'hx-put'), 'Should include hx-put');
        assert.ok(labels.some(l => l === 'hx-patch'), 'Should include hx-patch');
        assert.ok(labels.some(l => l === 'hx-delete'), 'Should include hx-delete');
    });

    test('provides hx-swap-oob value completions', async () => {
        const completions = await getCompletionsAt('<div hx-swap-oob=""></div>', 0, 18);
        const labels = getLabels(completions);
        assert.ok(labels.includes('true'), 'Should include true');
        assert.ok(labels.includes('innerHTML'), 'Should include innerHTML');
        assert.ok(labels.includes('outerHTML'), 'Should include outerHTML');
    });

    test('provides hx-disinherit completions', async () => {
        const completions = await getCompletionsAt('<div hx-disinherit=""></div>', 0, 20);
        const labels = getLabels(completions);
        assert.ok(labels.includes('*'), 'Should include wildcard *');
        assert.ok(labels.some(l => l === 'hx-get'), 'Should include hx-get as disinherit option');
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
