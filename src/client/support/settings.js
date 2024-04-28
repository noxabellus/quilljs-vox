export default function Settings(widget, obj) {
    const set = {};

    Object.entries(obj).forEach(([id, [value, parser, update]]) => {
        const elem = widget.querySelector(`input#${id}`);

        elem.value = value;

        Object.defineProperty(set, id, {
            get() { return value; },
            set(v) {
                value = v;
                elem.value = v;
                update(value);
            }
        });

        elem.addEventListener("change", () => {
            value = parser(elem.value);
            update(value);
        })

        update(value);
    });
    
    return set;
}