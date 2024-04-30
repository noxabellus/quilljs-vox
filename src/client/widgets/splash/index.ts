import Widget from "../../support/widget";
import Result from "../../support/result";
import { openVox, saveVox } from "../../support/file";

import splash_src from "./splash.html";
import Document from "../../support/document";
import { PathLike } from "original-fs";


export type SplashResult = Result<{filePath: PathLike, doc: Document}>;

export default async function Element(fileCallback: (res: SplashResult) => Promise<void>, container = document.body) {
    const splash_elem = Widget(splash_src);
    const new_button = splash_elem.querySelector("#new-file");
    const open_button = splash_elem.querySelector("#open-file");
    const app_settings_open_elem = splash_elem.querySelector("#app-settings-open");
    const app_settings_close_elem = splash_elem.querySelector("#app-settings-close");
    const app_settings_elem = splash_elem.querySelector("#app-settings");

    const splash = {
        elem: splash_elem,
        close() {
            this.elem.remove();
            this.elem = null;
        }
    };

    container.append(splash.elem);

    new_button.addEventListener("click", async () => {
        const doc = new Document("untitled document");

        const file_res = await saveVox(doc);
        
        if (Result.is_success(file_res)) {
            fileCallback.call(splash, Result.Success({filePath: file_res.body, doc}));
        } else {
            fileCallback.call(splash, file_res);
        }
    });

    open_button.addEventListener("click", async () => {
        const file_res = await openVox();
        fileCallback.call(splash, file_res);
    });

    app_settings_open_elem.addEventListener("click", () => {
        app_settings_elem.classList.add("visible");
    });

    app_settings_close_elem.addEventListener("click", () => {
        app_settings_elem.classList.remove("visible");
    });

    return splash;
}