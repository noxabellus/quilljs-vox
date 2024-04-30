
import fs from "fs/promises";

import remote from "./remote";
import Result from "./result";
import Document from "./document";
import { PathLike } from "original-fs";

export async function readText (path: PathLike): Promise<Result<string>> {
    try {
        return Result.Success(await fs.readFile(path, "utf8"));
    } catch (error) {
        return Result.Error(error.toString());
    }
}

export async function writeText (path: PathLike, text: string): Promise<Result<PathLike>> {
    try {
        await fs.writeFile(path, text);
        return Result.Success(path);
    } catch (error) {
        return Result.Error(error.toString());
    }
}

export async function readVox (path: PathLike): Promise<Result<Document>> {
    const res = await readText(path);

    if (Result.isSuccess(res)) {
        try {
            return Result.Success(Document.deserialize(res.body));
        } catch (error) {
            return Result.Error(error.toString());
        }
    } else {
        return res;
    }
}

export async function openVox () {
    let filePath;
    try {
        const fps = await remote.dialog.showOpenDialog({
            properties: ["openFile"],
            filters: [
                { name: "Vox Files", extensions: ["vox"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (fps.canceled || fps.filePaths.length != 1) {
            return Result.Failure();
        }

        filePath = fps.filePaths[0];
    } catch (error) {
        return Result.Error(error);
    }

    const res = await readVox(filePath);
    if (Result.isSuccess(res)) {
        return Result.Success({ filePath, doc: res.body });
    } else {
        return res;
    }
}

export async function writeVox (path: PathLike, data: Document): Promise<Result<PathLike>> {
    let text;
    try {
        text = data.serialize();
    } catch (error) {
        return Result.Error(error);
    }

    return writeText(path, text);
}

interface Filter {
    name: string;
    extensions: string[];
}

export async function saveWith<T> (filters: Filter[], callback: (filePath: PathLike) => Promise<Result<T>>): Promise<Result<T>> {
    let filePath;
    try {
        const fps = await remote.dialog.showSaveDialog({
            properties: ["showOverwriteConfirmation"],
            filters: [
                ...filters,
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (fps.canceled) {
            return Result.Failure();
        }

        filePath = fps.filePath;
    } catch (error) {
        return Result.Error(error);
    }

    return callback(filePath);

}

export async function saveHtml (data: string): Promise<Result<PathLike>> {
    return saveWith([{ name: "Html Files", extensions: ["html"] }], filePath => writeText(filePath, data));
}

export async function saveVox (data: Document): Promise<Result<PathLike>> {
    return saveWith([{ name: "Vox Files", extensions: ["vox"] }], filePath => writeVox(filePath, data));
}

export default {
    readText,
    writeText,
    readVox,
    openVox,
    writeVox,
    saveVox,
};
