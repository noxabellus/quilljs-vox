import Document from "./document";
import { AttributeMap, Op } from "quill-delta";
import { FullTheme, makeFullTheme, themeCss } from "./document-theme";
import { html_beautify } from "js-beautify";


export type SectionFn = (sectionIndex: number, section: Section, options: Options) => string;
export type DocumentTemplate = (title: string, theme: FullTheme, content: string) => string;
export type LineTemplate = (lineNumber: number, style: string[], content: string[]) => string;
export type AttributeProcessor = (node: Node, options: Options) => void;
export type ElemTemplate = (nodeData: NodeData) => string;
export type Node = { data: NodeData, template: ElemTemplate | null };
export type NodeData = { style: string } & AttributeMap;
export type Section = { ops: Op[], attributes: AttributeMap};

export type Format = {
    section: SectionFn,
    beautifier: (content: string) => string,
    minifier: (content: string) => string,
    defaultOptions: Options,
};

export type Options = {
    documentTemplate: DocumentTemplate,
    lineTemplate: LineTemplate,
    linkTemplate: ElemTemplate,
    styleTemplates: StyleTemplates,
    embedTemplates: Partial<Record<number, ElemTemplate>>,
    attributeProcessors: Partial<Record<string, AttributeProcessor>>,
    postProcess: "minify" | "beautify" | null,
};

export type StyleTemplates = {
    color: ElemTemplate,
    bold: ElemTemplate,
    italic: ElemTemplate,
    underline: ElemTemplate,
    strike: ElemTemplate,
    font: ElemTemplate,
};




export default function convertDocument (doc: Document, format: Format, userOptions?: Partial<Options>): string {
	const options: Options = {
        documentTemplate: userOptions?.documentTemplate || format.defaultOptions.documentTemplate,
        lineTemplate: userOptions?.lineTemplate || format.defaultOptions.lineTemplate,
        linkTemplate: userOptions?.linkTemplate || format.defaultOptions.linkTemplate,
        styleTemplates: { ...format.defaultOptions.styleTemplates, ...(userOptions?.styleTemplates || {}) },
        embedTemplates: { ...format.defaultOptions.embedTemplates, ...(userOptions?.embedTemplates || {}) },
        attributeProcessors: { ...format.defaultOptions.attributeProcessors, ...(userOptions?.attributeProcessors || {}) },
        postProcess: userOptions?.postProcess || format.defaultOptions.postProcess,
    };

	const sections: Section[] = [];

    let currentSection: Section;

	const newSection = () => {
        currentSection = {ops: [], attributes: {}};
		sections.push(currentSection);
	};

	newSection();

	doc.delta.forEach((op: Op) => {
		if (op.insert === "\n") {
            // handle eol
			currentSection.attributes = op.attributes || {};
			newSection();
		} else if (typeof op.insert === "number") {
            // handle embeds
			if (currentSection.ops.length) {
				newSection();
			}

			currentSection.ops.push(op);

			newSection();
		} else if (typeof op.insert == "string" && op.insert.indexOf("\n") >= 0) {
            // break up interior new lines into separate section objs
			const chunks = op.insert.split("\n");

			chunks.forEach((chunk: any, index: any): void => {
                currentSection.ops.push({
                    insert: chunk, attributes: op.attributes
                });

                if (chunks.length - 1 !== index) newSection();
            });
		} else {
            // inline text segment
			currentSection.ops.push(op);
		}
	});

    const interiorHtml = sections
        .map((line, index) =>
            format.section(index, line, options))
        .join("\n");

	const fullHtml = options.documentTemplate(doc.title || "untitled", makeFullTheme(doc.theme), interiorHtml);

    switch (options.postProcess) {
        case "minify":
            return format.minifier(fullHtml);
        case "beautify":
            return format.beautifier(fullHtml);
        default:
            return fullHtml;
    }
}

export const HtmlFormat: Format = {
    section: (sectionIndex, section, options) => {
        const attrs = Object.keys(section.attributes || { });

        return options.lineTemplate(
            sectionIndex,
            attrs.map(attr => attributeToCss(section, attr)),
            section.ops.map(op => lineToContent(op, options))
        );
    },

    minifier: _ => { throw "not implemented yet"; },

    beautifier: content =>
        html_beautify(content, {
        /* eslint-disable camelcase */
            indent_size: 4,
            indent_char: " ",
            wrap_line_length: 0,
            max_preserve_newlines: 0,
            preserve_newlines: true,
            end_with_newline: true,
            indent_inner_html: true,
            indent_body_inner_html: true,
            indent_head_inner_html: true,
            indent_empty_lines: false,
            extra_liners: [],
        /* eslint-enable camelcase */
        }),

    defaultOptions: {
        documentTemplate: (title, theme, content) => {
            return `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>${title}</title>
                        <style>${themeCss(theme, "#document")}</style>
                    </head>
                    <body>
                        <div id="document">
                            ${content}
                        </div>
                    </body>
                </html>
            `;
        },

        lineTemplate: (_lineNumber, style, content) => {
            let contentStr = content.join("");
            if (contentStr.length === 0) return "<br/>";

            contentStr = contentStr.replace(/^[ ]+/, w => "&nbsp;".repeat(w.length));

            const styleStr = style.length > 0 ? ` style="${style.join("")}"` : "";
            return `<p${styleStr}>${contentStr}</p>`;
        },

        linkTemplate: nodeData => `<a href="${nodeData.link}" style="${nodeData.style}">{content}</a>`,

        styleTemplates: {
            color: nodeData => `<span style="color:${nodeData.color}">${nodeData.content}</span>`,
            bold: nodeData => `<b>${nodeData.content}</b>`,
            italic: nodeData => `<i>${nodeData.content}</i>`,
            underline: nodeData => `<u>${nodeData.content}</u>`,
            strike: nodeData => `<s>${nodeData.content}</s>`,
            font: nodeData => `<span style="font-family:${nodeData.font}">${nodeData.content}</span>`
        },

        embedTemplates: {
            1: (attrs) => `<img src="${attrs.image}" alt="${attrs.alt}" />`,
        },

        attributeProcessors: {},

        postProcess: "beautify",
    }
};


function lineToContent (op: Op, options: Options): string {
    if (typeof op.insert === "number") {
        const embedTemplate = options.embedTemplates[op.insert];
        if (!embedTemplate) throw `missing template for embed id ${op.insert}`;

        return embedTemplate({...(op.attributes || {}), style: ""});
    }

    if (typeof op.insert !== "string")
        throw "unexpected op configuration";

    if (!op.attributes) {
        return op.insert;
    }

    return innerHtml(op.insert, op.attributes, options);
}

function attributeToCss (section: Section, attr: any): string {
    const value = section.attributes[attr];

    switch (attr) {
        case "align":
            return `text-align: ${value?.toString() || "left"};`;
        default:
            throw `unknown attribute ${attr}`;
    }
}

function innerHtml (content: string, attrs: AttributeMap, options: Options): string {
    Object.keys(attrs).forEach((attr) => {
        const node: Node = {
            template: null,
            data: {...attrs, content, style: ""}
        };

        switch (attr) {
            case "link":
                node.template = options.linkTemplate;
            break;

            case "color":
            case "bold":
            case "italic":
            case "underline":
            case "strike":
            case "font":
                node.template = options.styleTemplates[attr];
            break;

            default:
                if (options.attributeProcessors) {
                    const attributor = options.attributeProcessors[attr];
                    if (attributor) {
                        attributor(node, options);
                    }
                } else {
                    console.warn("unknown attribute", attr);
                }
            break;
        }

        if (!node.template) {
            console.log("missing template for node:", node);
            throw "missing node template";
        }

        content = node.template(node.data);
    });

    return content;
}
