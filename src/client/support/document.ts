import Quill from "quill/core";
import Delta, { AttributeMap, Op } from "quill-delta";
import History, { StackItem } from "quill/modules/history";

import { Theme, applyDocumentTheme, isThemeKey, isValidProperty } from "./document-theme";
import { Defined, forceVal } from "./nullable";

// import quillBaseCss from "../../extern/quill.core.css?raw";
// import { html_beautify } from "js-beautify";

import documentRender, { HtmlFormat } from "./document-render";
import Result from "./result";
import { toDataURL } from "./xhr";


export type ProtoStackItem = {
    delta: Op[],
    range: {index: number, length: number},
}

export type ProtoHistory = {
    undo: ProtoStackItem[],
    redo: ProtoStackItem[],
};

export type StackHistory = {
    undo: StackItem[],
    redo: StackItem[],
};

export type Block = {
    command: string,
    arg: Defined,
    body: Block[],
};

export type ImageDb = {
    lookup: Partial<Record<string, number>>,
    data: ImageEntry[],
};

export type ImageEntry = {
    hash: number,
    value: string,
};

export class Document {
    title: string | null;
    theme: Theme;
    delta: Op[];
    images: ImageDb;
    history: StackHistory | ProtoHistory;

    constructor (title?: string) {
        this.title = title || null;

        this.theme = {};

        this.delta = [];

        this.images = {
            lookup: {},
            data: [],
        };

        this.history = {
            undo: [],
            redo: [],
        };
    }

    hasImage (id: number): boolean {
        return this.images.data[id] !== undefined;
    }

    async registerImage (src: string): Promise<Result<number>> {
        if (src.startsWith("data:")) {
            const hash = hashString(src);
            const index = this.images.data.findIndex(({hash: h, value}) => {
                if (h !== hash) return false;
                return value == src;
            });

            if (index !== -1) {
                return Result.Success(index);
            } else {
                const newIndex = this.images.data.length;
                this.images.data.push({hash, value: src});
                return Result.Success(newIndex);
            }
        }

        const existingIndex = this.images.lookup[src];
        if (existingIndex !== undefined) {
            return Result.Success(existingIndex);
        }

        let dataUrl;
        const result = await toDataURL(src);

        if (Result.isSuccess(result)) {
            dataUrl = result.body;
        } else {
            return result;
        }

        const index = this.images.data.length;

        this.images.lookup[src] = index;
        this.images.data.push({hash: hashString(dataUrl), value: dataUrl});

        return Result.Success(index);
    }

    applyImages (elem: HTMLElement) {
        return applyDocumentImages(elem, this.images);
    }

    applyTheme (elem: HTMLElement) {
        return applyDocumentTheme(elem, this.theme);
    }

    linkEditor (editor: Quill) {
        editor.setContents(this.delta);
        loadHistoryStack(this.history, editor);
        applyDocumentTheme(editor.container, this.theme);
        applyDocumentImages(editor.container, this.images);
    }

    copyEditorDelta (delta: Delta) {
        this.delta = delta.ops;
    }

    copyEditorHistory (history: History) {
        this.history = history.stack;
    }

    copyEditorState ({delta, history}: {delta: Delta, history: History}) {
        this.delta = delta.ops;
        this.history = history.stack;
    }

    static deserialize (text: string): Document {
        const doc = {} as any;

        const blocks = makeBlocks(makeLines(text));
        blocks.forEach(b => parseBlock(doc, b));

        if (doc.images === undefined) doc.images = {lookup: {}, data: []};
        if (doc.theme === undefined) doc.theme = {};
        if (doc.delta === undefined) doc.delta = [];
        if (doc.history === undefined) doc.history = {undo: [], redo: []};

        Object.setPrototypeOf(doc, Document.prototype);

        return doc as Document;
    }

    serialize () {
        const lines =
            [ "theme"
            ,   ...Object.entries(this.theme).map(([key, value]) =>
                    `${key} ${JSON.stringify(value)}`
                ).map(indent)

            , "delta"
            ,   ...this.delta.flatMap(serializeDeltaOp).map(indent)

            , "images"
            ,   ...[ "lookup", ...Object.entries(this.images.lookup).map(([key,value]) => indent(`${JSON.stringify(key)} ${JSON.stringify(value)}`))
                   , "data", ...this.images.data.map(({hash, value}) => indent(`${hash} ${JSON.stringify(value)}`))
                   ]
                   .map(indent)

            , "history"
            ,   ...Object.entries(this.history).flatMap(([key, ops]) =>
                    [key, ...ops.flatMap(serializeHistoryOp).map(indent)]
                ).map(indent)
            ];
        return lines.join("\n");
    }

    render (): string {
        return documentRender(this, HtmlFormat) as string;
    }
}

export default Document;

export function serializeHistoryOp (op: StackItem): string[] {
    return [ `@ [${forceVal(op.range).index}, ${forceVal(op.range).length}]`
           ,    ...((op.delta.ops || op.delta) as Op[]).flatMap(serializeDeltaOp).map(indent)
           ];
}

export function serializeDeltaOp (op: Op): string[] {
    if (op.insert !== undefined) {
        return [ `I ${JSON.stringify(op.insert)}`
               ,    ...serializeAttributes(op.attributes).map(indent)
               ];
    } else if (op.delete !== undefined) {
        return [`D ${op.delete}`];
    } else if (op.retain !== undefined) {
        return [ `R ${op.retain}`
               ,    ...serializeAttributes(op.attributes).map(indent)
               ];
    } else {
        throw `unknown delta op ${op}`;
    }
}

export function serializeAttributes (attributes?: AttributeMap): string[] {
    if (attributes === undefined) return [];
    return Object.entries(attributes).map(([key, value]) => `${key} ${JSON.stringify(value)}`);
}

export function parseBlock (doc: Document, block: Block): void {
    if (block.arg !== null)
        throw `top level block should not have arg ${block.arg}`;

    switch (block.command) {
        case "history":
            if (doc.history !== undefined)
                throw "duplicate history block";

            doc.history = parseHistory(block.body);

            break;

        case "delta":
            if (doc.delta !== undefined)
                throw "duplicate delta block";

            doc.delta = parseDelta(block.body);

            break;

        case "theme":
            if (doc.theme !== undefined)
                throw "duplicate theme block";

            doc.theme = parseTheme(block.body);

            break;

        case "images":
            if (doc.images !== undefined)
                throw "duplicate images block";

            doc.images = parseImages(block.body);

            break;

        default:
            throw `unknown top level command ${block.command}`;
    }
}

export function parseTheme (blocks: Block[]): Theme {
    const theme = {} as any;

    blocks.forEach((b: Block) => {
        if (!isThemeKey(b.command))
            throw `unknown theme key ${b.command}`;

        if (theme[b.command] !== undefined)
            throw `duplicate theme key ${b.command}`;

        if (!isValidProperty(b.command, b.arg))
            throw `invalid theme value for key ${b.command}: ${b.arg}`;

        theme[b.command] = b.arg;
    });

    return theme;
}

export function parseImages (blocks: Block[]): ImageDb {
    const images = {} as any;

    blocks.forEach(b => {
        if (b.arg !== null)
            throw `images block should not have arg ${b.arg}`;

        if (images[b.command] !== undefined)
            throw `duplicate images block ${b.command}`;

        switch (b.command) {
            case "lookup":
                images.lookup = parseLookup(b.body);
                break;
            case "data":
                images.data = parseData(b.body);
                break;
            default:
                throw `unknown images block ${b.command}`;
        }
    });

    return images;
}

export function parseLookup (blocks: Block[]): Record<string, number> {
    const lookup = {} as Record<string, number>;

    blocks.forEach(b => {
        if (b.body.length > 0)
            throw "lookup should not have body";

        if (typeof b.arg !== "number")
            throw `lookup value should be number ${b.arg}`;

        const key = JSON.parse(b.command);

        lookup[key] = b.arg;
    });

    return lookup;
}

export function parseData (blocks: Block[]): ImageEntry[] {
    const data = [] as ImageEntry[];

    blocks.forEach(b => {
        if (b.body.length > 0)
            throw "data should not have body";

        if (typeof b.arg !== "string")
            throw `data value should be string ${b.arg}`;

        const hash = parseInt(b.command);

        if (isNaN(hash)) {
            throw `data hash is not a number ${b.command}`;
        }

        data.push({hash, value: b.arg});
    });

    return data;
}

export function parseHistory (blocks: Block[]): StackHistory {
    const history = {} as any;

    blocks.forEach(b => {
        if (b.arg !== null)
            throw `history block should not have arg ${b.arg}`;

        if (history[b.command] !== undefined)
            throw `duplicate history block ${b.command}`;

        if (["undo", "redo"].indexOf(b.command as any) < 0)
            throw `unknown history block ${b.command}`;

        history[b.command] = parseHistoryOps(b.body);
    });

    return history;
}

export function parseHistoryOps (blocks: Block[]): ProtoStackItem[] {
    const ops: ProtoStackItem[] = [];

    blocks.forEach(b => {
        if (b.command !== "@")
            throw `unknown history op ${b.command}`;

        ops.push(parseHistoryOp(b.arg, b.body));
    });

    return ops;
}

export function parseHistoryOp (arg: Defined, blocks: Block[]): ProtoStackItem {
    if (!(Array.isArray(arg) && arg.length === 2 && arg.every(Number.isInteger)))
        throw `invalid history range ${arg}`;

    const op: ProtoStackItem = {range: {index: arg[0], length: arg[1]}, delta: []};

    blocks.forEach(b => {
        op.delta.push(parseDeltaOp(b));
    });

    return op;
}

export function parseDelta (blocks: Block[]): Op[] {
    const delta: Op[] = [];

    blocks.forEach(b => {
        delta.push(parseDeltaOp(b));
    });

    return delta;
}

export function parseDeltaOp (block: Block): Op {
    switch (block.command) {
        case "I":
            return parseInsert(block.arg, block.body);

        case "D":
            return parseDelete(block.arg, block.body);

        case "R":
            return parseRetain(block.arg, block.body);

        default:
            throw `unknown delta op ${block.command}`;
    }
}

export function parseInsert (arg: Defined, blocks: Block[]): Op {
    // if (typeof arg !== "string")
    //     throw `insert should have string arg ${arg}`;

    return {insert: arg as string | Record<string, unknown>, attributes: parseAttributes(blocks)};
}

export function parseDelete (arg: Defined, blocks: Block[]): Op {
    if (blocks.length > 0)
        throw "delete should not have body";

    if (typeof arg !== "number")
        throw `delete should have number arg ${arg}`;

    return {delete: arg};
}

export function parseRetain (arg: Defined, blocks: Block[]): Op {
    if (typeof arg !== "number")
        throw `retain should have number arg ${arg}`;

    return {retain: arg, attributes: parseAttributes(blocks)};
}

export function parseAttributes (blocks: Block[]): AttributeMap {
    const attributes = {} as AttributeMap;

    blocks.forEach(b => {
        if (b.body.length > 0)
            throw "attributes should not have body";

        if (attributes[b.command] !== undefined)
            throw `duplicate attribute ${b.command}`;

        attributes[b.command] = b.arg;
    });

    return attributes;
}

export type Line = [number, string];

export function makeBlocks (lines: Line[], indent = 0): Block[] {
    const block: Block[] = [];
    while (lines.length > 0) {
        const [currIndent, currLine] = lines[0];

        if (currIndent < indent) {
            break;
        }

        lines.shift();

        const [command, arg] = makeCommand(currLine);

        if (lines.length > 0) {
            const [nextIndent, _] = lines[0];
            if (nextIndent > currIndent) {
                block.push({command, arg, body: makeBlocks(lines, nextIndent)});
                continue;
            }
        }

        block.push({command, arg, body: []});
    }
    return block;
}

export function makeCommand (line: string): [string, Defined] {
    const index = line.search(/\s/);
    if (index < 0) {
        return [line, null];
    } else {
        return [line.slice(0, index), JSON.parse(line.slice(index + 1))];
    }
}

export function makeLines (text: string): Line[] {
    return (
        text
            .split("\n")
            .map(line => {
                const indent = getIndent(line);
                return [indent, line.slice(indent)];
            })
            .filter(([_, line]: [number, string]) => line.length > 0) as Line[]
    );
}

export function loadHistoryStack (stack: ProtoHistory | StackHistory, quill: Quill) {
    quill.history.stack.undo = [];
    quill.history.stack.redo = [];

    stack.undo.forEach(elem =>
        quill.history.stack.undo.push({
            delta: new Delta(elem.delta),
            range: elem.range,
        })
    );

    stack.redo.forEach(elem =>
        quill.history.stack.redo.push({
            delta: new Delta(elem.delta),
            range: elem.range,
        })
    );
}

function indent (line: string): string {
    return `\t${line}`;
}

function getIndent (line: string): number {
    let i = 0;
    while (i < line.length && line[i] === "\t") {
        i++;
    }
    return i;
}


function applyDocumentImages (elem: HTMLElement, images: ImageDb) {
    let style = elem.querySelector("#image-sources");

    if (!style) {
        style = elem.appendChild(document.createElement("style"));
        style.id = "image-sources";
    }

    const css = images.data.map(({value}, index) => {
        return `img[data-img-id="${index}"] { content: url("${value}"); }`;
    }).join("\n");

    style.innerHTML = css;
}


function hashString (str: string): number {
    let hash = 0;

    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }

    return hash;
}
