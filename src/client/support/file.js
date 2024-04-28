
import fs from "fs/promises";

import remote from "./remote.js";
import Result from "./result.js";

export async function readText (path) {
    try {
        return Result.Success(await fs.readFile(path, "utf8"));
    } catch (error) {
        return Result.Error(error);
    }
}

export async function writeText (path, text) {
    try {
        await fs.writeFile(path, text);
        return Result.Success(path);
    } catch (error) {
        return Result.Error(error);
    }
}

export async function readVox (path) {
    const text = await readText(path);

    if (text.is_success()) {
        try {
            return Result.Success(JSON.parse(text.body));
        } catch (error) {
            return Result.Error(error);
        }
    } else {
        return text;
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

    const read_res = await readVox(filePath);
    if (read_res.is_success()) {
        return Result.Success({ filePath, obj: read_res.body });
    } else {
        return read_res;
    }
}

export async function writeVox (path, data) {
    let text;
    try {
        text = JSON.stringify(data, null, 4);
    } catch (error) {
        return Result.Error(error);
    }

    return writeText(path, text);
}

export async function saveVox (data) {
    let filePath;
    try {
        const fps = await remote.dialog.showSaveDialog({
            properties: ["showOverwriteConfirmation"],
            filters: [
                { name: "Vox Files", extensions: ["vox"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (fps.canceled) {
            return {
                success: false,
                is_error: false
            };
        }
        
        filePath = fps.filePath;
    } catch (error) {
        return {
            success: false,
            is_error: true,
            error
        };
    }

    return writeVox(filePath, data);
}

export default {
    readText,
    writeText,
    readVox,
    openVox,
    writeVox,
    saveVox,
};