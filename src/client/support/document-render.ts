import Document from "./document";
import { AttributeMap, Op } from "quill-delta";
import { FullTheme, makeFullTheme, themeCss } from "./document-theme";
import { html_beautify } from "js-beautify";


export type SectionFn = (sectionIndex: number, section: Section, options: Options) => string;
export type DocumentTemplate = (title: string, theme: FullTheme, content: string) => string;
export type EmptyTemplate = (sectionIndex: number, style: string, attributes: AttributeMap) => string;
export type SectionTemplate = (sectionIndex: number, style: string, content: string, attributes: AttributeMap) => string;
export type AttributeProcessor = (attributes: AttributeMap, options: Options) => ElemTemplate;
export type EmbedTemplate<T> = (embed: T, attributes: AttributeMap) => string;
export type ElemTemplate = (content: string, attributes: AttributeMap) => string;

export type Attributes = {
    attributes: AttributeMap,
}

export type Section = {
    ops: Op[],
    attributes: AttributeMap,
}

export type Format = {
    section: SectionFn,
    beautifier: (content: string) => string,
    minifier: (content: string) => string,
    defaultOptions: Options,
};

export type Options = {
    documentTemplate: DocumentTemplate,
    sectionTemplates: SectionTemplates,
    inlineTemplates: InlineTemplates,
    attributeProcessors: Partial<Record<string, AttributeProcessor>>,
    postProcess: "minify" | "beautify" | null,
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

export type ImageEmbed = { image: string };


export default function convertDocument (doc: Document, format: Format, userOptions?: Partial<Options>): string {
	const options: Options = {
        documentTemplate: userOptions?.documentTemplate || format.defaultOptions.documentTemplate,
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
        postProcess: userOptions?.postProcess || format.defaultOptions.postProcess,
    };

	const sections: Section[] = [];

    let currentSection: Section;

	const newOpSection = () => {
        currentSection = {ops: [], attributes: {}};
		sections.push(currentSection);
	};

	newOpSection();

	doc.delta.forEach((op: Op) => {
		if (op.insert === "\n") {
            // handle section endings
			currentSection.attributes = op.attributes || {};
			newOpSection();
		} else if (typeof op.insert == "string" && op.insert.indexOf("\n") >= 0) {
            // break up interior new lines into separate section objs
			const chunks = op.insert.split("\n");

			chunks.forEach((chunk: string, index: number): void => {
                currentSection.ops.push({
                    insert: chunk,
                    attributes: op.attributes,
                });

                if (chunks.length - 1 !== index) newOpSection();
            });
		} else {
            // inline segment
			currentSection.ops.push(op);
		}
	});

    const interiorHtml = sections
        .map((section, index) =>
            format.section(index, section, options))
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
    section: (sectionIndex, section: Section, options) => {
        const styleInner = sectionAttributesToCss(section.attributes);
        const style = styleInner.length > 0 ? ` style="${styleInner}"` : "";

        const content = section.ops.map(op => opToContent(op, options)).join("");

        if (content === "") {
            return options.sectionTemplates.empty(sectionIndex, style, section.attributes);
        } else if (section.attributes.header) {
            return options.sectionTemplates.header(sectionIndex, style, content, section.attributes);
        } else {
            return options.sectionTemplates.line(sectionIndex, style, content, section.attributes);
        }
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

        sectionTemplates: {
            empty: (_sectionNumber, _style) => "<br/>",

            line: (_sectionNumber, style, content) => {
                if (content.length === 0) return "<br/>";

                content = content.replace(/^[ ]+/, w => "&nbsp;".repeat(w.length));

                return `<p${style}>${content}</p>`;
            },

            header: (_sectionNumber, style, content, attrs) => `<h${attrs.header}${style}>${content}</h${attrs.header}>`,
        },

        inlineTemplates: {
            link: (content, attrs) => `<a href="${attrs.link}">${content}</a>`,
            background: (content, attrs) => `<span style="background:${attrs.color}">${content}</span>`,
            color: (content, attrs) => `<span style="color:${attrs.color}">${content}</span>`,
            bold: content => `<b>${content}</b>`,
            italic: content => `<i>${content}</i>`,
            underline: content => `<u>${content}</u>`,
            strike: content => `<s>${content}</s>`,
            font: (content, attrs) => `<span style="font-family:${attrs.font}">${content}</span>`,

            embeds: {
                image: (embed, attrs) => {
                    let size = "";
                    if (attrs.width) size += ` width=${attrs.width}`;
                    if (attrs.height) size += ` height=${attrs.height}`;

                    return `<img src="${embed.image}" alt="${attrs.alt}"${size}/>`;
                },
            }
        },

        attributeProcessors: {},

        postProcess: "beautify",
    }
};


function opToContent (op: Op, options: Options): string {
    if (typeof op.insert !== "string") {
        return embedHtml(op.insert, op.attributes || {}, options);
    }

    if (!op.attributes) {
        return op.insert;
    }

    return innerHtml(op.insert, op.attributes, options);
}

function sectionAttributesToCss (attributes: AttributeMap): string {
    return Object.entries(attributes).map(([attr, value]) => {
        switch (attr) {
            case "align":
                return `text-align: ${value?.toString() || "left"};`;
            default:
                return "";
        }
    }).join("");
}

function embedHtml (embed: unknown, attributes: AttributeMap, options: Options): string {
    if (!embed) {
        console.warn("missing embed", embed, attributes);
        throw "missing embed";
    }

    const keys = Object.keys(embed);

    if (keys.length !== 1) {
        console.warn("invalid embed", embed, attributes);
        throw "invalid embed";
    }

    const embedType = Object.keys(embed)[0];
    const embedTemplate = (options.inlineTemplates.embeds as any)[embedType];

    if (!embedTemplate) {
        console.warn("missing embed template", embed, attributes);
        throw "missing embed template";
    }

    return embedTemplate(embed, attributes);
}

function innerHtml (content: string, attrs: AttributeMap, options: Options): string {
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
                    console.warn("unknown attribute", attr, attrs[attr]);
                    throw `unknown attribute ${attr}`;
                }
            break;
        }

        if (!template) {
            console.log("missing template for node:", content, attrs, options);
            throw "missing node template";
        }

        content = template(content, attrs);
    });

    return content;
}
