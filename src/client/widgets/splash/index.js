import Widget from "../../support/widget.js";
import Result from "../../support/result.js";
import { openVox, saveVox } from "../../support/file.js";

import splash_src from "./splash.html";


export default async function Element(fileCallback, container = document.body) {
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
        const obj = {
            history: {
                undo: [],
                redo: [],
            },
            delta: [],
        };

        const file_res = await saveVox(obj);
        
        if (file_res.is_success()) {
            fileCallback.call(splash, Result.Success({filePath: file_res.body, obj}));
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