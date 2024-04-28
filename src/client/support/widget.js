export default function Widget(html) {
    const elem = document.createElement("div");
    elem.innerHTML = html;
    return elem.firstChild;
}