import * as AppTypes from "./types";

export type Settings = {
    keyBindings: KeyBindings,
};

export type KeyBindings = Partial<Record<KeyCombo, KeyAction>>;

export type KeyAction = (documentId: number | null, context: AppTypes.Context) => AppTypes.Action | null;

export type KeyCombo = `${ModifierString}+${Key}` | Key;
export type ModifierStringElement = "Control" | "Shift" | "Alt";
export type ModifierString = "Control" | "Shift" | "Alt" | "Control+Shift" | "Control+Alt" | "Shift+Alt" | "Control+Shift+Alt";
export type Key = typeof Keys[number];

export const Keys = [
    "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
] as const;

export type ShortcutModifiers = {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
};

export function makeModifierString(modifiers: ShortcutModifiers): ModifierString {
    let result = "";
    if (modifiers.ctrl) {
        result += "Control";
    }
    if (modifiers.alt) {
        if (result) {
            result += "+";
        }
        result += "Alt";
    }
    if (modifiers.shift) {
        if (result) {
            result += "+";
        }
        result += "Shift";
    }
    return result as ModifierString;
}

export function makeKey(key: string): Key | null {
    key = key.toUpperCase();
    if (Keys.includes(key as Key)) {
        return key as Key;
    }
    return null;
}

export function makeKeyCombo(modifiers: ShortcutModifiers, key: Key): KeyCombo {
    const modifierString = makeModifierString(modifiers);
    if (modifierString.length > 0) return `${modifierString}+${key}` as KeyCombo;
    else return key;
}

