
import remote from "./remote.js";
import fs from "fs/promises";


export async function writeFile (path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data));

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

export async function saveFile (data) {
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

        return await writeFile(fps.filePath, data);
    } catch (error) {
        return {
            success: false,
            is_error: true,
            error
        };
    }
}

export async function readFile (path) {
    try {
        const jsonData = await fs.readFile(path, "utf8");
        
        return {
            success: true,
            is_error: false,
            body: JSON.parse(jsonData),
        };
    } catch (error) {
        return {
            success: false,
            is_error: false,
            error
        };
    }
}

export async function openFile () {
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

        return await readFile(fps.filePaths[0]);
    } catch (error) {
        return {
            success: false,
            is_error: false,
            error
        };
    }
}

export default {
    writeFile,
    saveFile,
    readFile,
    openFile
};