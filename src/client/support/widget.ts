export default function Widget(html: string): HTMLElement {
    const elem = document.createElement("div");
    elem.innerHTML = html;
    return elem.firstChild as HTMLElement;
}