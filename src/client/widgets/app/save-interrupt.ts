import { Dispatch } from "react";

import Result from "../../support/result";
import remote from "../../support/remote";
import { saveVox, writeVox } from "../../support/file";
import { forceRef } from "../../support/nullable";

import { AppContext, AppStateAction } from "./types";


export default async function saveInterrupt(context: AppContext, dispatch: Dispatch<AppStateAction>, exit: () => void) {
    dispatch({ type: "set-lock-io", value: true });

    const question = await remote.dialog.showMessageBox({
        type: "question",
        title: "Unsaved Changes",
        message: "Would you like to save your changes before exiting?",
        buttons: ["Don't exit", "Exit without saving", "Save and exit"],
        defaultId: 0,
        cancelId: 0,
    });

    switch (question.response) {
        case 1: {
            dispatch({ type: "set-lock-io", value: false });
            return exit();
        }

        case 2: {
            let result;
            if (context.data.filePath) {
                result = await writeVox(context.data.filePath, forceRef(context.data.document));
            } else {
                result = await saveVox(forceRef(context.data.document));
            }

            if (Result.isSuccess(result)) {
                dispatch({ type: "set-lock-io", value: false });
                return exit();
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }

            return saveInterrupt(context, dispatch, exit);
        }

        default: {
            dispatch({ type: "set-lock-io", value: false });
            break;
        }
    }
}
