import Splash from "./widgets/splash";



Splash(async function (file_res) {
    if (file_res.is_success()) {
        this.close();

        const {filePath, obj} = file_res.body;

        console.log("loaded file", filePath, obj);

        await import("./widgets/editor").then(({default: Editor}) => {
            const editor = Editor(filePath, obj);
            window.editor = editor;
        });
    } else {
        alert(`failed to load file: ${file_res.body}`);
    }
});