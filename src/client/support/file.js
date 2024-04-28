
import remote from "./remote.js";
import fs from "fs/promises";


export async function readText (path) {
    try {
        return {
            success: true,
            is_error: false,
            body: await fs.readFile(path, "utf8"),
        };
    } catch (error) {
        return {
            success: false,
            is_error: false,
            error
        };
    }
}

export async function writeText (path, text) {
    try {
        await fs.writeFile(path, text);

        return {
            success: true,
            is_error: false,
        };
    } catch (error) {
        return {
            success: false,
            is_error: true,
            error
        };
    }
}

export async function readVox (path) {
    const text = await readText(path);

    if (text.success) {
        try {
            return {
                success: true,
                is_error: false,
                body: JSON.parse(text.body),
            };
        } catch (error) {
            return {
                success: false,
                is_error: false,
                error
            };
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
            return {
                success: false,
                is_error: false,
            };
        }

        filePath = fps.filePaths[0];
    } catch (error) {
        return {
            success: false,
            is_error: false,
            error
        };
    }

    return readVox(filePath);
}

export async function writeVox (path, data) {
    let text;
    try {
        text = JSON.stringify(data, null, 4);
    } catch (error) {
        return {
            success: false,
            is_error: true,
            error
        };
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