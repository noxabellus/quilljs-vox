import Widget from "../../support/widget";
import Result from "../../support/result";
import { openVox, saveVox } from "../../support/file";

import splashSrc from "./splash.html";
import Document from "../../support/document";
import { PathLike } from "original-fs";
import { forceVal } from "../../support/nullable";


export type SplashResult = Result<{filePath: PathLike, doc: Document}>;

export default async function Element(fileCallback: (res: SplashResult) => Promise<void>, container = document.body) {
    const splashElem = Widget(splashSrc);
    const newButton = forceVal(splashElem.querySelector("#new-file"));
    const openButtonElem = forceVal(splashElem.querySelector("#open-file"));
    const appSettingsOpenElem = forceVal(splashElem.querySelector("#app-settings-open"));
    const appSettingsCloseElem = forceVal(splashElem.querySelector("#app-settings-close"));
    const appSettingsElem = forceVal(splashElem.querySelector("#app-settings"));

    const splash = {
        elem: splashElem,
        close() {
            this.elem.remove();
            this.elem = null;
        }
    };

    container.append(splash.elem);

    newButton.addEventListener("click", async () => {
        const doc = new Document("untitled document");

        const fileRes = await saveVox(doc);

        if (Result.isSuccess(fileRes)) {
            fileCallback.call(splash, Result.Success({filePath: fileRes.body, doc}));
        } else {
            fileCallback.call(splash, fileRes);
        }
    });

    openButtonElem.addEventListener("click", async () => {
        const fileRes = await openVox();
        fileCallback.call(splash, fileRes);
    });

    appSettingsOpenElem.addEventListener("click", () => {
        appSettingsElem.classList.add("visible");
    });

    appSettingsCloseElem.addEventListener("click", () => {
        appSettingsElem.classList.remove("visible");
    });

    return splash;
}
