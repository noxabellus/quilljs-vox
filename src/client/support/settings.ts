export type SettingsEntry<T> = [T, (v: string) => T, (v: T) => void];

export type SettingsConfig = {
    [id: string]: SettingsEntry<unknown>
};

export type Settings<Proto extends SettingsConfig> = {
    [K in keyof Proto]: Proto[K][0]
};

export default function Settings(widget: HTMLElement, obj: SettingsConfig): Settings<typeof obj> {
    const set = {};

    Object.entries(obj).forEach(([id, [value, parser, update]]) => {
        const elem: HTMLInputElement = widget.querySelector(`input#${id}`);

        elem.value = value.toString();

        Object.defineProperty(set, id, {
            get() { return value; },
            set(v) {
                value = v;
                elem.value = v.toString();
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