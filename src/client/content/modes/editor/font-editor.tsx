import { ChangeEvent, useState } from "react";

import path from "node:path";

import { toDataURL } from "Support/xhr";
import { openWith } from "Support/file";
import Result from "Support/result";

import { DEFAULT_FONTS } from "Document/theme";

import Input from "Elements/input";
import Button from "Elements/input/button";
import Label from "Elements/label";
import Spacer from "Elements/spacer";
import SettingsSection from "Elements/settings-section";
import SettingsList from "Elements/settings-list";

import { useAppState } from "../../app/state";
import { useEditorState } from "./state";

import newImg from "Assets/wand.svg?raw";
import renameImg from "Assets/square-brackets.svg?raw";
import setImg from "Assets/checkmark.svg?raw";
import cancelImg from "Assets/circle-cross.svg?raw";
import deleteImg from "Assets/xmark.svg?raw";
import editFileImg from "Assets/file-pencil.svg?raw";


export default function FontEditor () {
    const [appContext, appDispatch] = useAppState();
    const [editorContext, editorDispatch] = useEditorState(appContext);
    const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
    const [renamingValue, setRenamingValue] = useState("");

    const renamingInProgress = renamingIndex !== null;

    const availableFonts = editorContext.document.fonts;

    const fontNames = Object.keys(availableFonts).sort();

    const checkOverlapping = (nameToCheck: string): number =>
        [...fontNames, ...DEFAULT_FONTS, "inherit"]
            .reduce((acc, name) => name === nameToCheck? acc + 1 : acc, 0)
    ;


    const fonts = fontNames.map((fontName, index) => {
        const isRenaming = renamingIndex === index;

        const beginRename = () => {
            setRenamingIndex(index);
            setRenamingValue(fontName);
        };

        const renameFontTemp = (e: ChangeEvent<HTMLInputElement>) => {
            setRenamingValue(e.target.value);
        };

        let overlappingName = false;
        if (renamingIndex !== null) {
            const existingCount = checkOverlapping(renamingValue);
            if (existingCount > 0 && (!(existingCount === 1 && renamingValue === fontName))) {
                overlappingName = true;
            }
        }

        const renameFont = () => {
            setRenamingIndex(null);

            editorDispatch({
                type: "rename-font",
                value: {
                    oldName: fontName,
                    newName: renamingValue,
                },
            });
        };

        const cancelRename = () => {
            setRenamingIndex(null);
        };

        const editFont = async () => {
            appDispatch({type: "set-lock-io", value: true});

            const result = await openWith([{name: "Font Files", extensions: ["ttf", "otf"]}], toDataURL);

            appDispatch({type: "set-lock-io", value: false});

            if (Result.isSuccess(result)) {
                editorDispatch({
                    type: "set-font-data",
                    value: {
                        name: fontName,
                        data: result.body.data,
                    },
                });
            } else if (Result.isError(result)) {
                alert(`Failed to load font:\n\t${result.body}`);
            }
        };

        const deleteFont = () => {
            editorDispatch({
                type: "delete-font",
                value: fontName,
            });
        };

        const color = overlappingName? "red" : isRenaming? "var(--primary-color)" : "limegreen";

        return <li key={fontName}>
            <Label title="User font" style={{color}} >
                { isRenaming
                    ? <div>
                        <Input type="text" style={{fontSize: "1.2em", minWidth: "12em"}} value={renamingValue} onChange={renameFontTemp}/>
                        <Spacer/>
                        <Button.Icon disabled={overlappingName} title={overlappingName? "A font with this name already exists" : "Set font name"} svg={setImg} onClick={renameFont}/>
                        <Button.Icon title="Cancel renaming" svg={cancelImg} onClick={cancelRename}/>
                    </div>
                    : <span style={{fontFamily: fontName}}>{fontName}</span>
                }
                { !isRenaming &&
                    <>
                        <div>
                            <Button.Icon title="Rename font" svg={renameImg} onClick={beginRename}/>
                            <Button.Icon title="Set file for font" svg={editFileImg} onClick={editFont}/>
                            <Button.Icon title="Delete font" svg={deleteImg} onClick={deleteFont}/>
                        </div>
                    </>
                }
            </Label>
        </li>;
    });

    const addNewFont = async () => {
        appDispatch({type: "set-lock-io", value: true});

        const result = await openWith([{name: "Font Files", extensions: ["ttf", "otf"]}], toDataURL);

        appDispatch({type: "set-lock-io", value: false});

        if (Result.isSuccess(result)) {
            let newName;

            const fileName = path.basename(
                result.body.filePath as string,
                path.extname(result.body.filePath as string)
            );

            if (checkOverlapping(fileName) === 0) {
                newName = fileName;
            } else {
                newName = "new font";
                while (fontNames.includes(newName)) newName = `${newName}0`;
            }

            editorDispatch({
                type: "set-font-data",
                value: {
                    name: newName,
                    data: result.body.data,
                },
            });
        } else if (Result.isError(result)) {
            alert(`Failed to load font:\n\t${result.body}`);
        }
    };

    return <SettingsSection>
        <h1>Fonts</h1>
        <SettingsList>
            <li><Label title="Built in font" style={{color: "yellow"}}><span style={{fontFamily:"serif"}}>serif</span><i>(Builtin)</i></Label></li>
            <li><Label title="Built in font" style={{color: "yellow"}}><span style={{fontFamily:"sans-serif"}}>sans-serif</span><i>(Builtin)</i></Label></li>
            <li><Label title="Built in font" style={{color: "yellow"}}><span style={{fontFamily:"monospace"}}>monospace</span><i>(Builtin)</i></Label></li>
            {fonts}
        </SettingsList>
        <Button.Icon disabled={renamingInProgress} title={"Begin registering a new font"} svg={newImg} onClick={addNewFont}/>
    </SettingsSection>;
}
