import { Defined } from "Support/nullable";
import { StackItem } from "quill/modules/history";
import { Theme } from "./theme";
import { Op } from "quill/core";

export type ProtoStackItem = {
    delta: Op[],
    range: {index: number, length: number},
}

export type ProtoHistory = {
    undo: ProtoStackItem[],
    redo: ProtoStackItem[],
};

export type StackHistory = {
    undo: StackItem[],
    redo: StackItem[],
};

export type Block = {
    command: string,
    arg: Defined,
    body: Block[],
};

export type ImageDb = {
    lookup: Partial<Record<string, number>>,
    data: ImageEntry[],
};

export type FontDb = {
    [key: string]: string,
};

export type ImageEntry = {
    hash: number,
    value: string,
};

export type Document = {
    title: string | null,
    theme: Theme,
    delta: Op[],
    images: ImageDb,
    fonts: FontDb,
    history: StackHistory | ProtoHistory,
};
