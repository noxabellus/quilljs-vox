import Splash from "./widgets/splash";
import Editor from "./widgets/editor";
import { readVox } from "./support/file";

// const filePath = "/home/nox/projects/vox/working_dir/new_format.vox";
// const vox = await readVox(filePath);
// Editor(filePath, vox.body)

Splash(async function (file_res) {
    if (file_res.is_success()) {
        this.close();

        const {filePath, doc} = file_res.body;

        console.log("loaded doc", filePath, doc);

        window.editor = Editor(filePath, doc);
    } else {
        alert(`failed to load file: ${file_res.body}`);
    }
});