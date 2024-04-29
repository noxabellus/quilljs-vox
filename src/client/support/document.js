import { THEME_KEYS, applyDocumentTheme } from "./document-theme.js";
import { loadHistoryStack } from "./history.js";
import quillBaseCss from "../../extern/quill.core.css?raw";

export class Document {
    constructor () {
        this.theme = {};

        this.delta = [];

        this.history = {
            undo: [],
            redo: [],
        };
    }

    generateStyles () {
        console.log("TODO");
        return `
            ${quillBaseCss}
        `;
    }

    applyTheme (elem) {
        return applyDocumentTheme(elem, this.theme);
    }

    linkEditor (editor) {
        editor.setContents(this.delta);
        loadHistoryStack(this.history, editor);
        this.history = editor.history.stack;
    }

    static deserialize (text) {
        const doc = {};

        const blocks = makeBlocks(makeLines(text));
        blocks.forEach(b => parseBlock(doc, b));

        if (doc.theme === undefined) doc.theme = {};
        if (doc.delta === undefined) doc.delta = [];
        if (doc.history === undefined) doc.history = {undo: [], redo: []};

        Object.setPrototypeOf(doc, Document.prototype);

        return doc;
    }

    serialize () {
        const lines =
            [ "theme"
            ,   ...Object.entries(this.theme).map(([key, value]) =>
                    `${key} ${JSON.stringify(value)}`
                ).map(indent)

            , "delta"
            ,   ...this.delta.flatMap(serializeDeltaOp).map(indent)
            
            , "history"
            ,   ...Object.entries(this.history).flatMap(([key, ops]) =>
                    [key, ...ops.flatMap(serializeHistoryOp).map(indent)]
                ).map(indent)
            ];
        return lines.join("\n");
    }
}

export default Document;

export function serializeHistoryOp (op) {
    return [ `@ [${op.range.index}, ${op.range.length}]`
           ,    ...(op.delta.ops || op.delta).flatMap(serializeDeltaOp).map(indent)
           ];
}

export function serializeDeltaOp (op) {
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

export function serializeAttributes (attributes) {
    if (attributes === undefined) return [];
    return Object.entries(attributes).map(([key, value]) => `${key} ${JSON.stringify(value)}`);
}

export function parseBlock (doc, block) {
    if (block.arg !== undefined)
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

        default:
            throw `unknown top level command ${block.command}`;
    }
}

export function parseTheme (blocks) {
    const theme = {};

    blocks.forEach(b => {
        if (!THEME_KEYS.includes(b.command)) 
            throw `unknown theme key ${b.command}`;

        if (theme[b.command] !== undefined)
            throw `duplicate theme key ${b.command}`;

        theme[b.command] = b.arg;
    });

    return theme;
}

export function parseHistory (blocks) {
    const history = {};
    
    blocks.forEach(b => {
        if (b.arg !== undefined)
            throw `history block should not have arg ${b.arg}`;

        if (history[b.command] !== undefined) 
            throw `duplicate history block ${b.command}`;

        history[b.command] = parseHistoryOps(b.body);
    });

    return history;
}

export function parseHistoryOps (blocks) {
    const ops = [];

    blocks.forEach(b => {
        if (b.command !== "@")
            throw `unknown history op ${b.command}`;

        ops.push(parseHistoryOp(b.arg, b.body));
    });

    return ops;
}

export function parseHistoryOp (arg, blocks) {
    if (!(Array.isArray(arg) && arg.length === 2 && arg.every(Number.isInteger)))
        throw `invalid history range ${arg}`;

    const op = {range: {index: arg[0], length: arg[1]}, delta: []};

    blocks.forEach(b => {
        op.delta.push(parseDeltaOp(b));
    });

    return op;
}

export function parseDelta (blocks) {
    const delta = [];

    blocks.forEach(b => {
        delta.push(parseDeltaOp(b));
    });

    return delta;
}

export function parseDeltaOp (block) {
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

export function parseInsert (arg, blocks) {
    return {insert: arg, attributes: parseAttributes(blocks)};
}

export function parseDelete (arg, blocks) {
    if (blocks.length > 0)
        throw "delete should not have body";

    return {delete: arg};
}

export function parseRetain (arg, blocks) {
    return {retain: arg, attributes: parseAttributes(blocks)};
}

export function parseAttributes (blocks) {
    const attributes = {};

    blocks.forEach(b => {
        if (b.body.length > 0)
            throw "attributes should not have body";

        if (attributes[b.command] !== undefined)
            throw `duplicate attribute ${b.command}`;

        attributes[b.command] = b.arg;
    });

    return attributes;
}

export function makeBlocks (lines, indent = 0) {
    let block = [];
    while (lines.length > 0) {
        let [currIndent, currLine] = lines[0];

        if (currIndent < indent) {
            break;
        }

        lines.shift();

        let [command, arg] = makeCommand(currLine);

        if (lines.length > 0) {
            let [nextIndent, nextLine] = lines[0];
            if (nextIndent > currIndent) {
                block.push({command, arg, body: makeBlocks(lines, nextIndent)});
                continue;
            }
        }

        block.push({command, arg, body: []});
    }
    return block;
}

export function makeCommand (line) {
    const index = line.search(/\s/);
    if (index < 0) {
        return [line];
    } else {
        return [line.slice(0, index), JSON.parse(line.slice(index + 1))];
    }
}

export function makeLines (text) {
    return text
        .split("\n")
        .map(line => {
            const indent = getIndent(line);
            return [indent, line.slice(indent)];
        })
        .filter(([indent, line]) => line.length > 0);
}

function indent (line) {
    return `\t${line}`;
}

function getIndent (line) {
    let i = 0;
    while (i < line.length && line[i] === "\t") {
        i++;
    }
    return i;
}