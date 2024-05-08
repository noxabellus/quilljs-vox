import { AttributeMap, Op } from "quill/core";
import { StackItem } from "quill/modules/history";
import { Block, Document, FontDb, ImageDb, ImageEntry, ProtoStackItem, StackHistory } from "./types";
import { Defined, forceVal } from "Support/nullable";
import { Theme, isThemeKey, isValidProperty } from "./theme";


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

        case "fonts":
            if (doc.fonts !== undefined)
                throw "duplicate fonts block";

            doc.fonts = parseFonts(block.body);

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

export function parseFonts (blocks: Block[]): FontDb {
    const fonts = {} as any;

    blocks.forEach(b => {
        if (b.arg !== null)
            throw `fonts block should not have arg ${b.arg}`;

        if (fonts[b.command] !== undefined)
            throw `duplicate fonts block ${b.command}`;

        if (typeof b.command !== "string")
            throw `fonts block should have string command ${b.command}`;

        fonts[b.command] = b.arg;
    });

    return fonts;
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


export function indent (line: string): string {
    return `\t${line}`;
}

export function getIndent (line: string): number {
    let i = 0;
    while (i < line.length && line[i] === "\t") {
        i++;
    }
    return i;
}
