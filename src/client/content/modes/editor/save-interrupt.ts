import { Dispatch } from "react";

import Result from "Support/result";
import remote from "Support/remote";
import { saveVox, writeVox } from "Support/file";

import * as AppTypes from "../../app/types";
import * as EditorTypes from "./types";


export default async function saveInterrupt(editorContext: EditorTypes.Context, appDispatch: Dispatch<AppTypes.Action>, exit: () => void, dontExit: () => void) {
    appDispatch({ type: "set-lock-io", value: true });

    const question = await remote.dialog.showMessageBox({
        type: "question",
        title: "Unsaved Changes",
        message: "Would you like to save your changes before exiting?",
        detail: `${editorContext.document.title} @[${editorContext.filePath || "Never saved"}] has unsaved changes.`,
        buttons: ["Don't exit", "Exit without saving", "Save and exit"],
        defaultId: 0,
        cancelId: 0,
    });

    switch (question.response) {
        case 1: {
            appDispatch({ type: "set-lock-io", value: false });
            return exit();
        }

        case 2: {
            let result;
            if (editorContext.filePath) {
                result = await writeVox(editorContext.filePath, editorContext.document);
            } else {
                result = await saveVox(editorContext.document);
            }

            if (Result.isSuccess(result)) {
                appDispatch({ type: "set-lock-io", value: false });
                return exit();
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }

            return saveInterrupt(editorContext, appDispatch, exit, dontExit);
        }

        default: {
            appDispatch({ type: "set-lock-io", value: false });
            return dontExit();
        }
    }
}
