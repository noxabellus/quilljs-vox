import { sanitize } from "quill/formats/link";
import { EmbedBlot, Root } from  "parchment";


const ATTRIBUTES = ["title", "alt", "height", "width"];


export default class Image extends EmbedBlot {
    static blotName = "image";
    static tagName = "IMG";

    constructor (scroll: Root, domNode: Node) {
        super(scroll, domNode);
    }

    static create(value: any) {
        const node = document.createElement("img");

        node.dataset.imgId = value;

        return node;
    }

    static formats(domNode: Element) {
        return ATTRIBUTES.reduce((formats: Record<string, string | null>, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }

            return formats;
        }, {});
    }

    static match(url: string) {
        return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url);
    }

    static sanitize(url: string) {
        return sanitize(url, ["http", "https", "data"]) ? url : "";
    }

    static value(domNode: HTMLImageElement) {
        return domNode.dataset.imgId;
    }

    format(name: string, value: string) {
        const node = this.domNode as Element;
        if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
                node.setAttribute(name, value);
            } else {
                node.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}
