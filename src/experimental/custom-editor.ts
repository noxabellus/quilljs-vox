/* eslint-disable @typescript-eslint/no-unused-vars */

import Document from "Support/document";
import { FullTheme, Theme, makeFullTheme, themeCss } from "Support/document-theme";
import { readVox } from "Support/file";
import Result from "Support/result";

type Op
    = InsertOp
    | RetainOp
    | DeleteOp
    ;

type InsertOp = {
    insert: string | Embed;
    attributes: AttributeMap;
};

type RetainOp = {
    retain: number;
};

type DeleteOp = {
    delete: number;
};

type Embed
    = ImageEmbed
    ;

type ImageEmbed = {
    image: string;
};

type Serializable = boolean | number | string | Serializable[] | SerializableMap | null;
type SerializableMap = { [K in string]?: Serializable };

type AttributeMap
    = SerializableMap
    & Partial<BuiltinAttributes>
    ;

type BuiltinAttributes = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strike: boolean,
    blockquote: boolean,
    code: CodeFormat,
    script: TextScript,
    color: Color,
    background: Color,
    font: string,
    size: Length,
    link: string,
    list: "ordered" | "bullet",
    indent: number,
    direction: TextDirection,
    align: TextAlign,
    header: number,
    title: string,
    width: number,
    height: number,
};

type TextScript = "sub" | "super";
type TextDirection = "rtl" | "ltr";
type TextAlign = "left" | "center" | "right" | "justify";
type Color = ColorName | HSL | RGB | HEX;

type CodeFormat = boolean | string;

type HSL = {hsl: [number, number, number]};
type RGB = {rgb: [number, number, number]};
type HEX = {hex: string};
type Length
    = { pt: number }
    | { px: number }
    | { pc: number }
    | { cm: number }
    | { mm: number }
    | { in: number }
    ;
type ColorName = "black" | "silver" | "gray" | "white" | "maroon" | "red" | "purple" | "fuchsia" | "green" | "lime" | "olive" | "yellow" | "navy" | "blue" | "teal" | "aqua";

type Data = InsertOp[];
type Delta = Op[];


export type Style = Partial<Record<string, string>>;

export type SingleContent = Text | HTMLElement;
export type ListContent = SingleContent[];
export type Content = SingleContent | ListContent;

export type SectionFn = (sectionId: number, section: Section, options: Options) => HTMLElement;
export type EmptyTemplate = (sectionId: number, style: Style, attributes: AttributeMap) => HTMLElement;
export type SectionTemplate = (sectionId: number, style: Style, content: Content, attributes: AttributeMap) => HTMLElement;
export type AttributeProcessor = (attributes: AttributeMap, options: Options) => ElemTemplate;
export type EmbedTemplate<T> = (embed: T, attributes: AttributeMap) => HTMLElement;
export type ElemTemplate = (content: SingleContent, attributes: AttributeMap) => HTMLElement;

export type Section
    = SectionInfo
    & LayoutInfo
    ;

export type SectionNode
    = HTMLElement
    & { dataset: {
            sectionId: string,
        } & DOMStringMap
    }
    ;

export type SectionInfo = {
    ops: InsertOp[],
    attributes: AttributeMap,
};

export type SectionDelta = {
    start: number,
    length: number,
    opDelta: Delta,
};

export type LayoutInfo = {
    index: number,
    length: number,
};

export type Format = {
    section: SectionFn,
    defaultOptions: Options,
};

export type Options = {
    sectionTemplates: SectionTemplates,
    inlineTemplates: InlineTemplates,
    attributeProcessors: Partial<Record<string, AttributeProcessor>>,
};

export type SectionTemplates = {
    empty: EmptyTemplate,
    line: SectionTemplate,
    header: SectionTemplate,
};

export type InlineTemplates = {
    link: ElemTemplate,
    color: ElemTemplate,
    background: ElemTemplate,
    bold: ElemTemplate,
    italic: ElemTemplate,
    underline: ElemTemplate,
    strike: ElemTemplate,
    font: ElemTemplate,
    embeds: EmbedTemplates,
};

export type EmbedTemplates = {
    image: EmbedTemplate<ImageEmbed>,
};

export type Doc = {
    title: string,
    data: Data,
    theme: Theme,
};







function deepCompare(a: any, b: any): boolean {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;

        if (a.length !== b.length) return false;

        return a.every((v, i) => deepCompare(v, b[i]));
    }

    if (typeof a === "object") {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) return false;

        return aKeys.every(key => deepCompare(a[key], b[key]));
    }

    return false;
}

function deepCopy (value: any): any {
    if (Array.isArray(value)) {
        return value.map(deepCopy);
    }

    if (typeof value === "object") {
        const out: any = {};

        for (const key in value) {
            out[key] = deepCopy(value[key]);
        }

        return out;
    }

    return value;
}

function representationError(message: string, ...args: any[]): never {
    console.warn(message, ...args);
    throw message;
}




export default function convertDocument (doc: Doc, format: Format, userOptions?: Partial<Options>, offsets: [number, number] = [0,0]): [Section[], HTMLElement[]] {
	const options: Options = {
        sectionTemplates: {
            ...format.defaultOptions.sectionTemplates,
            ...(userOptions?.sectionTemplates || {}),
        },
        inlineTemplates: {
            ...format.defaultOptions.inlineTemplates,
            ...(userOptions?.inlineTemplates || {}),
            embeds: { ...format.defaultOptions.inlineTemplates.embeds, ...(userOptions?.inlineTemplates?.embeds || {}) },
        },
        attributeProcessors: {
            ...format.defaultOptions.attributeProcessors,
            ...(userOptions?.attributeProcessors || {}),
        },
    };

    const [idOffset, indexOffset] = offsets;

    let index = indexOffset;

	const sections: Section[] = [];
    let currentSection: Section;

	const newSection = () => {
        currentSection = {ops: [], attributes: {}, index, length: 0};
		sections.push(currentSection);
	};

    const lastOp = (): InsertOp | null => {
        if (currentSection.ops.length === 0) {
            return null;
        }

        return currentSection.ops[currentSection.ops.length - 1];
    };

	newSection();

	doc.data.forEach((op: InsertOp) => {
		if (typeof op.insert == "string" && op.insert.indexOf("\n") >= 0) {  // terminator segment
            if (op.insert.match(/[^\n]g/)) {
                representationError("invalid insert, interior newline", op);
            }

            currentSection.attributes = deepCopy(op.attributes) || {};

            let i = 0;

            if (currentSection.ops.length == 0) {
                currentSection.ops.push({ insert: "\n", attributes: {} });
                currentSection.length += 1;
                index += 1;
                i = 1;
            }

			for (; i < op.insert.length - 1; i++) {
                sections.push({
                    ops: [{ insert: "\n", attributes: {} }],
                    attributes: {},
                    length: 1,
                    index
                });
                index += 1;
            }

            newSection();
		} else { // inline segment
            const prev = lastOp();

            if (prev && typeof prev.insert == "string" && typeof op.insert == "string" && prev.insert !== "\n" && deepCompare(prev.attributes, op.attributes)) {
                prev.insert += op.insert;
            } else {
                currentSection.ops.push(deepCopy(op));
            }

            let len;
            if (typeof op.insert == "string") {
                len = op.insert.length;
            } else {
                len = 1;
            }

            currentSection.length += len;
            index += len;
		}
	});

    if (sections[sections.length - 1].ops.length === 0) {
        sections.pop();
    }

    const interiorHtml =
        sections.map((section, index) =>
            format.section(index + idOffset, section, options));

    return [sections, interiorHtml];
}

export const HtmlFormat: Format = {
    section: (sectionId, section: Section, options) => {
        const style = sectionAttributesToCss(section.attributes);

        if (section.ops.length === 0) {
            representationError("invalid section", section);
        }

        let out;
        // this is a bad idea here, because you cant really properly edit a br
        // if (section.ops.length === 1 && section.ops[0].insert === "\n") {
        //     out = options.sectionTemplates.empty(sectionId, style, section.attributes);
        // } else {
            const content = section.ops.map(op => opToContent(op, options));

            if (section.attributes.header) {
                out = options.sectionTemplates.header(sectionId, style, content, section.attributes);
            } else {
                out = options.sectionTemplates.line(sectionId, style, content, section.attributes);
            }
        // }

        out.dataset.sectionId = sectionId.toString();

        return out;
    },


    defaultOptions: {
        sectionTemplates: {
            empty: (_sectionNumber, _style) => document.createElement("br"),

            line: (_sectionNumber, style, content) => {
                const p = document.createElement("p");
                setStyle(p, style);
                setContent(p, content);
                return p;
            },

            header: (_sectionNumber, style, content, attrs) => {
                const h = document.createElement(`h${attrs.header}`);
                setStyle(h, style);
                setContent(h, content);
                return h;
            },
        },

        inlineTemplates: {
            link: (content, attrs) => {
                const a = document.createElement("a");
                a.href = attrs.link as string;
                setContent(a, content);
                return a;
            },

            background: (content, attrs) => {
                const span = document.createElement("span");
                setColor(span, "backgroundColor", attrs.background);
                setContent(span, content);
                return span;
            },

            color: (content, attrs) => {
                const span = document.createElement("span");
                setColor(span, "color", attrs.color);
                setContent(span, content);
                return span;
            },

            font: (content, attrs) => {
                const span = document.createElement("span");
                span.style.fontFamily = attrs.font as string;
                setContent(span, content);
                return span;
            },

            bold: content => {
                const b = document.createElement("b");
                setContent(b, content);
                return b;
            },

            italic: content => {
                const i = document.createElement("i");
                setContent(i, content);
                return i;
            },

            underline: content => {
                const u = document.createElement("u");
                setContent(u, content);
                return u;
            },

            strike: content => {
                const s = document.createElement("s");
                setContent(s, content);
                return s;
            },

            embeds: {
                image: (embed, attrs) => {
                    const img = document.createElement("img");
                    img.src = embed.image;
                    if (attrs.title !== undefined) img.alt = attrs.title;
                    if (attrs.width) img.width = attrs.width;
                    if (attrs.height) img.height = attrs.height;
                    return img;
                },
            }
        },

        attributeProcessors: {},
    }
};


function opToContent (op: InsertOp, options: Options): SingleContent {
    if (typeof op.insert !== "string") {
        return embedHtml(op.insert, op.attributes, options);
    }

    return innerHtml(op.insert, op.attributes, options);
}

function sectionAttributesToCss (attributes: AttributeMap): Style {
    const style = {} as Style;

    Object.entries(attributes).forEach(([attr, value]) => {
        switch (attr) {
            case "align":
                style.textAlign = `${value?.toString() || "left"}`; // FIXME: this doesn't have to be here once we have proprietary file format
            break;
        }
    });

    return style;
}

function embedHtml (embed: Embed, attributes: AttributeMap, options: Options): SingleContent {
    const keys = Object.keys(embed);

    if (keys.length !== 1) {
        representationError("invalid embed", embed, attributes);
    }

    const embedType = keys[0];
    const embedTemplate = (options.inlineTemplates.embeds as any)[embedType];

    if (!embedTemplate) {
        representationError("missing embed template", embed, attributes, options);
    }

    return embedTemplate(embed, attributes);
}

function innerHtml (content: string, attrs: AttributeMap, options: Options): SingleContent {
    let body: SingleContent = document.createTextNode(content);

    Object.keys(attrs).forEach((attr) => {
        let template: ElemTemplate | null = null;

        switch (attr) {
            case "background":
            case "link":
            case "color":
            case "bold":
            case "italic":
            case "underline":
            case "strike":
            case "font":
                template = options.inlineTemplates[attr];
            break;

            default:
                if (options.attributeProcessors) {
                    const attributor = options.attributeProcessors[attr];
                    if (attributor) {
                        template = attributor(attrs, options);
                    }
                } else {
                    representationError("unknown attribute", attr, attrs[attr]);
                }
            break;
        }

        if (!template) {
            representationError("missing template for node", content, attr, attrs, options);
        }

        body = template(body, attrs);
    });

    return body;
}

function setStyle(elem: HTMLElement, style: Style) {
    for (const prop in style) (elem.style as any)[prop] = style[prop];
}

function setColor(elem: HTMLElement, prop: "color" | "backgroundColor" | "borderColor", color?: Color) {
    if (color === undefined) return;

    if (typeof color === "string") {
        elem.style[prop] = color;
    } else if ("hex" in color) {
        elem.style[prop] = color.hex;
    } else if ("rgb" in color) {
        elem.style[prop] = `rgb(${color.rgb.join(", ")})`;
    } else if ("hsl" in color) {
        elem.style[prop] = `hsl(${color.hsl.join(", ")})`;
    }
}

function setContent(elem: HTMLElement, content: Content) {
    if (!Array.isArray(content)) {
        if (typeof content === "string") {
            elem.appendChild(document.createTextNode(content));
        } else {
            elem.appendChild(content);
        }
    } else {
        content.forEach((c) => {
            if (typeof c === "string") {
                elem.appendChild(document.createTextNode(c));
            } else {
                elem.appendChild(c);
            }
        });
    }
}





















const doc = await readVox("/home/nox/projects/vox/working_dir/woah.vox");

if (!Result.isSuccess(doc))
    throw "fuck";

const data = doc.body.delta as InsertOp[];

// const data: InsertOp[] = [
//     {insert: "hello world", attributes: {}},
//     {insert: "\n", attributes: {}},
//     {insert: "i am an editor", attributes: {}},
// ];

const container = document.body.appendChild(document.createElement("div"));
container.contentEditable = "true";
container.style.whiteSpace = "break-spaces";
const [sections, documentNodes] = convertDocument({data, theme: {}, title: "woah"}, HtmlFormat);
container.append(...documentNodes);




container.addEventListener("beforeinput", (e: InputEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    const selection = document.getSelection();

    if (selection?.rangeCount !== 1)
        representationError("beforeinput event fired with no selection", e);

    const range: Range = selection?.getRangeAt(0);

    const selectedElems =
        documentNodes
            .filter(elem => elem instanceof HTMLElement
                         && range.intersectsNode(elem)
                         && elem.dataset.sectionId !== undefined) as SectionNode[];

    const selectedSectionIds =
        selectedElems
            .map(elem =>
                parseInt(elem.dataset.sectionId));

    const startNode = findNearestContentNode(range.startContainer, range.startOffset);
    const endNode = findNearestContentNode(range.endContainer, range.endOffset);

    const norm = {
        start: {
            sectionId: findSectionId(startNode),
            offset: range.startOffset + calculateLocalOffset(startNode),
        },
        end: {
            sectionId: findSectionId(endNode),
            offset: range.endOffset + calculateLocalOffset(endNode),
        },
    };

    const norm2 = {
        start: sections[norm.start.sectionId].index + norm.start.offset,
        end: sections[norm.end.sectionId].index + norm.end.offset,
    };

    const internal = {
        index: norm2.start,
        length: norm2.end - norm2.start,
    };

    const delta: Delta = [];
    const sectionDelta: SectionDelta = {
        start: norm.start.sectionId,
        length: norm.end.sectionId - norm.start.sectionId + 1,
        opDelta: delta,
    };

    let selectionOffset = 0;

    switch (e.inputType) {
        case "insertText":
            delta.push({ retain: internal.index });
            if (internal.length > 0) delta.push({ delete: internal.length });
            if (e.data !== null) {
                delta.push({ insert: e.data, attributes: {} }); // FIXME: attributes
                selectionOffset = 1;
            }
        break;

        case "insertParagraph":
            delta.push({ retain: internal.index });
            if (internal.length > 0) delta.push({ delete: internal.length });
            delta.push({ insert: "\n", attributes: {} });
            selectionOffset = 1;
        break;

        case "deleteContentBackward":
            if (internal.length > 0) {
                delta.push({ retain: internal.index - internal.length });
                delta.push({ delete: internal.length });
            } else {
                delta.push({ retain: internal.index - 1});
                delta.push({ delete: 1 });
                selectionOffset = -1;
            }
        break;

        case "deleteContentForward":
            if (internal.length > 0) {
                delta.push({ retain: internal.index });
                delta.push({ delete: internal.length });
            } else {
                delta.push({ retain: internal.index });
                delta.push({ delete: 1 });
            }
        break;


        default:
            console.warn("unhandled input type", e.inputType);
            return;
    }

    applySectionDelta(sectionDelta);

    setSelection(internal.index + selectionOffset);
});















function applySectionDelta (sectionDelta: SectionDelta) {
    console.log("applying selection delta", sectionDelta, sections.flatMap(section => section.ops.slice().map(op => deepCopy(op))));

    const mutatedSections = sections.splice(sectionDelta.start, sectionDelta.length);
    const droppedNodes = documentNodes.splice(sectionDelta.start, sectionDelta.length);

    const flatOffset = mutatedSections[0].index;
    const flatMutatedOps = mutatedSections.flatMap(section => [...deepCopy(section.ops), { insert: "\n", attributes: deepCopy(section.attributes) }]);
    if (flatMutatedOps.length === 0) return;                                          // ^ this is necessary because we've removed it in section conversion?

    if ("retain" in sectionDelta.opDelta[0]) {
        sectionDelta.opDelta[0].retain -= flatOffset;
    }

    applyDelta(sectionDelta.opDelta, flatMutatedOps);

    const [newSections, newNodes] = convertDocument({data: flatMutatedOps, theme: {}, title: "woah"}, HtmlFormat, {}, [sectionDelta.start, flatOffset]);

    sections.splice(sectionDelta.start, 0, ...newSections);

    droppedNodes.forEach(node => node.remove());

    if (newNodes.length > 0) {
        if (sectionDelta.start == 0) {
            container.prepend(...newNodes);
        } else {
            let lastNode = documentNodes[sectionDelta.start - 1];

            newNodes.forEach(node => {
                lastNode.insertAdjacentElement("afterend", node);
                lastNode = node;
            });
        }

        documentNodes.splice(sectionDelta.start, 0, ...newNodes);
    }

    const lastMutated = mutatedSections[mutatedSections.length - 1];
    const lastNew = newSections[newSections.length - 1];
    const indexOffset = lastNew.index - lastMutated.index;
    const lengthOffset = lastNew.length - lastMutated.length;
    const offset = indexOffset + lengthOffset;

    console.log("offsets", indexOffset, lengthOffset, offset);

    if (offset !== 0) {
        for (let i = sectionDelta.start + newSections.length; i < sections.length; i++) {
            sections[i].index += offset;
        }
    }

    if (newSections.length !== mutatedSections.length) {
        for (let i = sectionDelta.start + newNodes.length; i < documentNodes.length; i++) {
            documentNodes[i].dataset.sectionId = i.toString();
        }
    }

    console.log("selection delta applied", sections.flatMap(section => section.ops.slice().map(op => deepCopy(op))));
}




function applyDelta (delta: Delta, data: InsertOp[]) {
    let searchBaseIndex = 0;
    let searchBaseOffset = 0;

    delta.forEach(op => {
        if ("retain" in op) {
            console.log("retain started", searchBaseIndex, searchBaseOffset, deepCopy(data));

            const [newBaseIndex, opInternalOffset] =
                findOpLocation(searchBaseIndex, searchBaseOffset + (op as RetainOp).retain, data);

            searchBaseIndex = newBaseIndex;
            searchBaseOffset = opInternalOffset;

            console.log("retain finished", searchBaseIndex, searchBaseOffset, deepCopy(data));
        } else if ("insert" in op) {
            console.log("insert started", searchBaseIndex, searchBaseOffset, op.insert, deepCopy(data));

            const [opIndex, opInternalOffset] = findOpLocation(searchBaseIndex, searchBaseOffset, data);

            const toSplit = data[opIndex];

            if (searchBaseOffset > 0) {
                const [op1, op2] = splitOp(toSplit, opInternalOffset);

                data.splice(opIndex, 1, op1, op as InsertOp, op2);
            } else {
                data.splice(opIndex, 0, op as InsertOp);
            }

            searchBaseIndex = opIndex + 1;
            searchBaseOffset = 0;

            console.log("insert finished", searchBaseIndex, searchBaseOffset, deepCopy(data));
        } else if ("delete" in op) {
            console.log("delete started", searchBaseIndex, searchBaseOffset, op.delete, deepCopy(data));
            // eslint-disable-next-line prefer-const
            let [startIndex, startInternalOffset] = findOpLocation(searchBaseIndex, searchBaseOffset, data);

            // eslint-disable-next-line prefer-const
            let [endIndex, endInternalOffset] = findOpLocation(searchBaseIndex, searchBaseOffset + (op as DeleteOp).delete, data);

            console.log("delete locations", startIndex, startInternalOffset, endIndex, endInternalOffset);

            const startOp = data[startIndex];
            const endOp = data[endIndex];

            if (typeof startOp.insert != "string" || typeof endOp.insert != "string")
                representationError("delete of non-string op nyi", startOp, endOp);

            if (startIndex === endIndex) {
                if (startInternalOffset > 0 && endInternalOffset < opLength(startOp)) {
                    startOp.insert = startOp.insert.slice(0, startInternalOffset) + startOp.insert.slice(endInternalOffset);
                } else if (startInternalOffset > 0) {
                    startOp.insert = startOp.insert.slice(0, startInternalOffset);
                } else {
                    startOp.insert = startOp.insert.slice(endInternalOffset);
                }
            } else {
                if (startInternalOffset > 0) {
                    if (startInternalOffset >= startOp.insert.length)
                        representationError("invalid start offset", startOp, startInternalOffset);

                    startOp.insert = startOp.insert.slice(0, startInternalOffset);
                    startIndex += 1;
                }

                if (endInternalOffset > 0) {
                    if (endInternalOffset >= endOp.insert.length)
                        representationError("invalid end offset", endOp, endOp.insert.length, endInternalOffset, endInternalOffset - endOp.insert.length);

                    endOp.insert = endOp.insert.slice(endInternalOffset);
                    endIndex -= 1;
                }

                data.splice(
                    startIndex,
                    endIndex - startIndex + 1,
                );
            }

            // FIXME: this should definitely be changing the searchBaseOffset, maybe the index
            console.log("delete finished", searchBaseIndex, searchBaseOffset, deepCopy(data));
        } else {
            representationError("invalid op", op);
        }
    });
}

function findOpLocation (searchBaseIndex: number, offset: number, data: InsertOp[]): [number, number] {
    if (offset == 0) return [searchBaseIndex, 0];

    if (searchBaseIndex < data.length) {
        const op = data[searchBaseIndex];
        const len = opLength(op);

        if (len > offset) {
            return [searchBaseIndex, offset];
        } else {
            return findOpLocation(searchBaseIndex + 1, offset - len, data);
        }
    } else {
        representationError("invalid search offset", searchBaseIndex, offset, data);
    }
}

function splitOp (op: InsertOp, offset: number): [InsertOp, InsertOp] {
    if (typeof op.insert !== "string")
        representationError("cannot split non-string op", op, offset);

    return [
        { insert: op.insert.slice(0, offset), attributes: deepCopy(op.attributes) },
        { insert: op.insert.slice(offset), attributes: deepCopy(op.attributes) },
    ];
}

function opLength (op: InsertOp): number {
    if (typeof op.insert == "string") {
        return op.insert.length;
    } else {
        return 1;
    }
}
















function calculateLocalOffset (node: Node): number {
    const root = findSectionNode(node);

    if (node === root) return 0;

    if (node.parentNode === null)
        representationError("measured text node has no parent");

    return calculateLocalOffset(node.parentNode) + calculateSiblingOffset(node);
}

function calculateSiblingOffset (node: Node): number {
    if (node.previousSibling === null) return 0;

    return calculateLength(node.previousSibling) + calculateSiblingOffset(node.previousSibling);
}

function calculateLength (elem: Node): number {
    if (elem instanceof Text) {
        return elem.length;
    } else if (elem.hasChildNodes()) {
        return Array.from(elem.childNodes).reduce((acc, child) => acc + calculateLength(child), 0);
    } else {
        return 1;
    }
}

function findSectionNode (node: Node): SectionNode {
    if (node instanceof HTMLElement && node.dataset.sectionId !== undefined) {
        return node as SectionNode;
    }

    if (node.parentElement !== null) {
        return findSectionNode(node.parentElement);
    }

    representationError("cannot find section for node", node);
}

function findNearestContentNode (node: Node, offset: number): Node {
    if (node == container) {
        const children = Array.from(node.childNodes);
        node = children[offset];

        if (node === undefined)
            representationError("invalid offset if findSectionId", offset);
    }

    return node;
}

function findSectionId (node: Node): number {
    const x = findSectionNode(node);
    return parseInt(x.dataset.sectionId);
}












function setSelection (start: number, end?: number) {
    const selection = window.getSelection();
    if (!selection) throw "what the fuck do we do now";
    selection.removeAllRanges();

    const range = getBrowserRange(start, end);
    selection.addRange(range);
}

function getBrowserRange (start: number, end?: number): Range {
    console.log("get browser range", start, end);

    const range = new Range();
    const startData = getBrowserContainerAndOffset(start);

    range.setStart(...startData);
    if (end !== undefined) {
        range.setEnd(...getBrowserContainerAndOffset(end));
    } else {
        range.setEnd(...startData);
    }

    console.log("got selection range", range);
    return range;
}

function getBrowserContainerAndOffset (index: number): [Node, number] {
    console.log("calculating container and offset for index", index);

    for (let i = 0; i < sections.length; i ++) {
        const a = sections[i];
        const b = sections[i + 1];

        if (!b || b.index >= index) {
            console.log(`picking node ${i}`, a, documentNodes[i], `recursing with ${index - a.index}`);
            return getBrowserContainerAndOffsetInNode(documentNodes[i], index - a.index);
        }

        console.log(`skipping node ${i}`, a, documentNodes[i], index);
    }

    representationError("cannot get browser container and offset for index", index);
}

function getBrowserContainerAndOffsetInNode (node: Node, index: number): [Node, number] {
    const children = Array.from(node.childNodes);

    for (let i = 0; i < children.length; i ++) {
        const a = children[i];
        const b = children[i + 1];

        if (!b || calculateLocalOffset(b) > index) {
            const x = calculateLocalOffset(a);
            if (a instanceof Text) return [a as Node, index - x];
            else {
                return getBrowserContainerAndOffsetInNode(a, index);
            }
        }
    }

    return [node, index];
}
