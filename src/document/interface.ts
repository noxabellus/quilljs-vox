import Quill from "Extern/quill";
import Delta from "quill-delta";
import History from "quill/modules/history";

import Result from "Support/result";
import { toDataURL } from "Support/xhr";

import { DEFAULT_FONTS, applyDocumentTheme } from "./theme";
import documentRender, { HtmlFormat } from "./render";
import { Document, FontDb, ImageDb, ProtoHistory, StackHistory } from "./types";
import { indent, makeBlocks, makeLines, parseBlock, serializeDeltaOp, serializeHistoryOp } from "./serial";



export function create (title?: string): Document {
    return {
        title: title || null,
        theme: {},
        delta: [],
        images: {
            lookup: {},
            data: [],
        },
        fonts: {},
        history: {
            undo: [],
            redo: [],
        },
    };
}

export function isBlank (doc: Document): boolean {
        return (doc.delta.length === 0
                || (doc.delta.length === 1 && doc.delta[0].insert === "\n"
                    && Object.keys(doc.delta[0].attributes ?? {}).length === 0))
            && Object.keys(doc.theme).length == 0
            && doc.images.data.length == 0
            && Object.keys(doc.fonts).length == 0
            ;;
    }

export function hasFont (doc: Document, name: string): boolean {
    return doc.fonts[name] !== undefined;
}

export function hasImage (doc: Document, id: number): boolean {
    return doc.images.data[id] !== undefined;
}

export function deleteFont (doc: Document, name: string): Result<void> {
    if (name in DEFAULT_FONTS) {
        return Result.Error(`cannot delete default font ${name}`);
    }

    if (doc.fonts[name] === undefined) {
        return Result.Error(`font ${name} not found`);
    }

    delete doc.fonts[name];

    return Result.Success(void 0);
}

export function renameFont (doc: Document, oldName: string, newName: string): Result<void> {
    if (oldName in DEFAULT_FONTS) {
        return Result.Error(`cannot rename default font ${oldName}`);
    }

    if (newName in DEFAULT_FONTS) {
        return Result.Error(`cannot overwrite default font name ${newName}`);
    }

    if (doc.fonts[oldName] === undefined) {
        return Result.Error(`font ${oldName} not found`);
    }

    doc.fonts[newName] = doc.fonts[oldName];
    delete doc.fonts[oldName];

    return Result.Success(void 0);
}

export function registerFontData (doc: Document, name: string, data: string): Result<void> {
    if (name in DEFAULT_FONTS) {
        return Result.Error(`cannot overwrite default font name ${name}`);
    }

    if (!isValidFontData(data)) {
        return Result.Error("invalid font data");
    }

    doc.fonts[name] = data;
    return Result.Success(void 0);
}

export async function registerFontFile (doc: Document, name: string, src: string): Promise<Result<void>> {
    if (name in DEFAULT_FONTS) {
        return Result.Error(`cannot overwrite default font name ${name}`);
    }

    if (isValidFontData(src)) {
        doc.fonts[name] = src;
        return Result.Error("use registerFontData instead");
    }

    const result = await toDataURL(src);

    if (Result.isSuccess(result)) {
        if (!isValidFontData(result.body.data)) {
            return Result.Error("invalid font data");
        }

        doc.fonts[name] = result.body.data;
        return Result.Success(void 0);
    } else {
        return result;
    }
}

export async function registerImage (doc: Document, src: string): Promise<Result<number>> {
    if (src.startsWith("data:")) {
        const hash = hashString(src);
        const index = doc.images.data.findIndex(({hash: h, value}) => {
            if (h !== hash) return false;
            return value == src;
        });

        if (index !== -1) {
            return Result.Success(index);
        } else {
            const newIndex = doc.images.data.length;
            doc.images.data.push({hash, value: src});
            return Result.Success(newIndex);
        }
    }

    const existingIndex = doc.images.lookup[src];
    if (existingIndex !== undefined) {
        return Result.Success(existingIndex);
    }

    let dataUrl;
    const result = await toDataURL(src);

    if (Result.isSuccess(result)) {
        dataUrl = result.body.data;
    } else {
        return result;
    }

    const index = doc.images.data.length;

    doc.images.lookup[src] = index;
    doc.images.data.push({hash: hashString(dataUrl), value: dataUrl});

    return Result.Success(index);
}

export function applyImages (doc: Document, elem: HTMLElement) {
    return applyDocumentImages(elem, doc.images);
}

export function applyFonts (doc: Document, elem: HTMLElement) {
    return applyDocumentFonts(elem, doc.fonts);
}

export function applyTheme (doc: Document, elem: HTMLElement) {
    return applyDocumentTheme(elem, doc.theme);
}

export function linkEditor (doc: Document, editor: Quill) {
    editor.setContents(doc.delta);
    loadHistoryStack(doc.history, editor);
    applyDocumentTheme(editor.container, doc.theme);
    applyDocumentImages(editor.container, doc.images);
    applyDocumentFonts(editor.container, doc.fonts);
}

export function copyEditorDelta (doc: Document, delta: Delta) {
    doc.delta = delta.ops;
}

export function copyEditorHistory (doc: Document, history: History) {
    doc.history = history.stack;
}

export function copyEditorState (doc: Document, {delta, history}: {delta: Delta, history: History}) {
    doc.delta = delta.ops;
    doc.history = history.stack;
}

export function deserialize (text: string): Document {
    const doc = {} as any;

    const blocks = makeBlocks(makeLines(text));
    blocks.forEach(b => parseBlock(doc, b));

    if (doc.images === undefined) doc.images = {lookup: {}, data: []};
    if (doc.theme === undefined) doc.theme = {};
    if (doc.delta === undefined) doc.delta = [];
    if (doc.history === undefined) doc.history = {undo: [], redo: []};

    return doc as Document;
}

export function serialize (doc: Document): string {
    const lines =
        [ "theme"
        ,   ...Object.entries(doc.theme).map(([key, value]) =>
                `${key} ${JSON.stringify(value)}`
            ).map(indent)

        , "delta"
        ,   ...doc.delta.flatMap(serializeDeltaOp).map(indent)

        , "images"
        ,   ...[ "lookup", ...Object.entries(doc.images.lookup).map(([key,value]) => indent(`${JSON.stringify(key)} ${JSON.stringify(value)}`))
                , "data", ...doc.images.data.map(({hash, value}) => indent(`${hash} ${JSON.stringify(value)}`))
                ]
                .map(indent)

        , "fonts"
        ,   ...Object.entries(doc.fonts).map(([key, value]) =>
                `${key} ${JSON.stringify(value)}`
            ).map(indent)

        , "history"
        ,   ...Object.entries(doc.history).flatMap(([key, ops]) =>
                [key, ...ops.flatMap(serializeHistoryOp).map(indent)]
            ).map(indent)
        ];
    return lines.join("\n");
}

export function render (doc: Document): string {
    return documentRender(doc, HtmlFormat) as string;
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



function applyDocumentImages (elem: HTMLElement, images: ImageDb) {
    let style = elem.querySelector("#image-sources");

    if (!style) {
        style = elem.appendChild(document.createElement("style"));
        style.id = "image-sources";
    }

    const css = images.data.map(({value}, index) =>
        `img[data-img-id="${index}"] { content: url("${value}"); }`
    ).join("\n");

    style.innerHTML = css;
}

function applyDocumentFonts (elem: HTMLElement, fonts: FontDb) {
    let style = elem.querySelector("#font-sources");

    if (!style) {
        style = elem.appendChild(document.createElement("style"));
        style.id = "font-sources";
    }

    const css = Object.entries(fonts).map(([name, value]) =>
        `@font-face { font-family: "${name}"; src: url("${value}"); }`
    ).join("\n");

    style.innerHTML = css;
}


function isValidFontData (src: string): boolean {
    return src.match(/^data:font\/(ttf|otf);base64,/) !== null;
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
