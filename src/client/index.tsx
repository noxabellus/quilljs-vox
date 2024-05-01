// import Splash, { SplashResult } from "./widgets/splash";
// import Editor from "./widgets/editor";
// import Result from "./support/result";

// import { readVox } from "./support/file";
// const filePath = "/home/nox/projects/vox/working_dir/new_format.vox";
// const doc_res = await readVox(filePath);
// if (Result.not_success(doc_res)) {
//     alert(`failed to load file: ${Result.unsuccessful_message(doc_res)}`);
//     throw "failed"
// }
// Editor(filePath, doc_res.body)

// Splash(async function (fileRes: SplashResult) {
//     if (Result.isSuccess(fileRes)) {
//         this.close();

//         const {filePath, doc} = fileRes.body;

//         console.log("loaded doc", filePath, doc);

//         const editor = Editor(filePath, doc) as any;
//         Object.assign(window, {editor});
//     } else {
//         alert(`failed to load file: ${Result.problemMessage(fileRes)}`);
//     }
// });
import { createRoot } from "react-dom/client";

import { forceVal } from "./support/nullable";

import Toolbar from "./widgets/editor/toolbar";

// import Delta from "quill-delta";
// import { useRef } from "react";
// import Editor from "./widgets/editor";
// import Quill from "quill";


const App = () => {
    // const quillRef = useRef<Quill>();

    // return <div>
    //     <Editor
    //         ref={quillRef}
    //         readOnly={false}
    //         defaultValue={new Delta()
    //             .insert("Hello")
    //             .insert("\n", { header: 1 })
    //             .insert("Some ")
    //             .insert("initial", { bold: true })
    //             .insert(" ")
    //             .insert("content", { underline: true })
    //             .insert("\n")}
    //         onSelectionChange={(range, _oldRange, _source) => console.log(range)}
    //         onTextChange={(delta, _oldDelta, _source) => console.log(delta)}
    //     />
    // </div>;

    return <Toolbar />;
};

const domNode = forceVal(document.getElementById("navigation"));
const root = createRoot(domNode);
root.render(<App />);
