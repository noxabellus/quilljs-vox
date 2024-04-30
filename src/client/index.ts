import Splash, { SplashResult } from "./widgets/splash";
import Editor from "./widgets/editor";
import Result from "./support/result";

// import { readVox } from "./support/file";
// const filePath = "/home/nox/projects/vox/working_dir/new_format.vox";
// const doc_res = await readVox(filePath);
// if (Result.not_success(doc_res)) {
//     alert(`failed to load file: ${Result.unsuccessful_message(doc_res)}`);
//     throw "failed"
// }
// Editor(filePath, doc_res.body)

Splash(async function (fileRes: SplashResult) {
    if (Result.isSuccess(fileRes)) {
        this.close();

        const {filePath, doc} = fileRes.body;

        console.log("loaded doc", filePath, doc);

        const editor = Editor(filePath, doc) as any;
        Object.assign(window, {editor});
    } else {
        alert(`failed to load file: ${Result.problemMessage(fileRes)}`);
    }
});
