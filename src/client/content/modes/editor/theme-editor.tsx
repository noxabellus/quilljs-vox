import { parseFloatSafe, parseIntSafe } from "Support/number";

import { Color, Dimensions, Length, THEME_UNITS, Theme, lengthUnit, lengthConvert, propertyType, themeValue, DEFAULT_DOCUMENT_THEME, Font, DEFAULT_FONTS } from "Document/theme";

import Dropdown from "Elements/dropdown";
import Input from "Elements/input";
import Label from "Elements/label";

import { useEditorState } from "./state";
import SettingsList from "Elements/settings-list";
import SettingsSection from "Elements/settings-section";
import { useAppState } from "../../app/state";




const ThemeField = ({fieldName}: {fieldName: keyof Theme}) => {
    const [appContext, _appDispatch] = useAppState();
    const [editorContext, editorDispatch] = useEditorState(appContext);

    const theme = editorContext.document.theme;

    const property = themeValue(theme, fieldName);

    const numToFixed = (num: number) => Math.round(num * 1e2) / 1e2;

    switch (propertyType(property as any)) {
        case "length": {
            const prop = property as Length;
            const unit = lengthUnit(prop);
            const value = (prop as any)[unit] as number;

            const changeUnit = (i: number) => {
                const newUnit = THEME_UNITS[i];
                const converted = numToFixed(lengthConvert(theme, value, unit, newUnit));

                editorDispatch({
                    type: "set-theme-property",
                    value: {
                        key: fieldName,
                        data: { [newUnit]: converted } as Theme[typeof fieldName],
                    },
                });
            };

            return <div>
                <Input
                    step="0.01"
                    min="-9999"
                    max="9999"
                    name={fieldName}
                    type="number"
                    value={value}
                    onChange={e => {
                        const value = parseFloatSafe(e.target.value);
                        editorDispatch({
                            type: "set-theme-property",
                            value: {
                                key: fieldName,
                                data: { [unit]: value } as Theme[typeof fieldName],
                            },
                        });
                    }}
                />
                <Dropdown
                    selected={THEME_UNITS.indexOf(unit)}
                    onChange={changeUnit}
                >
                    {THEME_UNITS.map((unit, i) => <option key={i}>{unit}</option>)}
                </Dropdown>
            </div>;
        }

        case "dimensions": {
            const dims = property as Dimensions;
            const dimNames = ["top", "right", "bottom", "left"];

            return <div>
                {dims.map((dim, dimIndex) => {
                    const unit = lengthUnit(dim);
                    const value = (dim as any)[unit] as number;

                    const changeUnit = (i: number) => {
                        const newUnit = THEME_UNITS[i];
                        const converted = numToFixed(lengthConvert(theme, value, unit, newUnit));

                        const newDims: Dimensions = [...dims];
                        newDims[dimIndex] = { [newUnit]: converted } as Length;

                        editorDispatch({
                            type: "set-theme-property",
                            value: {
                                key: fieldName,
                                data: newDims,
                            },
                        });
                    };

                    return <Label key={dimIndex}>
                        <span>{dimNames[dimIndex]}</span>
                        <div>
                            <Input
                                step="0.01"
                                min="-9999"
                                max="9999"
                                name={`${fieldName}${dimIndex? "-" + dimNames[dimIndex] : ""}`}
                                type="number"
                                value={value}
                                onChange={e => {
                                    const value = parseFloatSafe(e.target.value);
                                    const newDims: Dimensions = [...dims];
                                    newDims[dimIndex] = { [unit]: value } as Length;
                                    editorDispatch({
                                        type: "set-theme-property",
                                        value: {
                                            key: fieldName,
                                            data: newDims,
                                        },
                                    });
                                }}
                            />
                            <Dropdown
                                selected={THEME_UNITS.indexOf(unit)}
                                onChange={changeUnit}
                            >
                                {THEME_UNITS.map((unit, i) => <option key={i}>{unit}</option>)}
                            </Dropdown>
                        </div>
                    </Label>;
                })}
            </div>;
        }

        case "color": {
            const compNames = ["r", "g", "b"];
            const comps = property as Color;

            return <div>
                {comps.map((comp, compIndex) => {
                    return <Label key={compIndex}>
                        <span>{compNames[compIndex]}</span>
                        <Input
                            step="1"
                            min="0"
                            max="255"
                            name={`${fieldName}${compIndex? "-" + compNames[compIndex] : ""}`}
                            type="number"
                            value={comp}
                            onChange={e => {
                                const value = parseIntSafe(e.target.value);
                                const newComps = [...comps] as Color;
                                newComps[compIndex] = value;
                                editorDispatch({
                                    type: "set-theme-property",
                                    value: {
                                        key: fieldName,
                                        data: newComps,
                                    },
                                });
                            }}
                        />
                    </Label>;
                })}
            </div>;
        }

        case "font": {
            const value = (property as Font).fontName;

            const actualFontNames = [...Object.keys(editorContext.document.fonts), ...DEFAULT_FONTS];
            if (fieldName != "base-font-family") actualFontNames.push("inherit");

            const fontNames = actualFontNames.slice();
            if (!fontNames.includes(value)) fontNames.push(value);
            fontNames.sort();

            const selected = fontNames.indexOf(value);

            const changeFont = (i: number) => {
                const newFontName = fontNames[i];

                editorDispatch({
                    type: "set-theme-property",
                    value: {
                        key: fieldName,
                        data: { fontName: newFontName },
                    },
                });
            };

            return <div>
                <Dropdown
                    selected={selected}
                    onChange={changeFont}
                >
                    {fontNames.map((fontName: string, i: number) => {
                        if (actualFontNames.includes(fontName)) {
                            return <option key={i} title="Click to select a different font" style={{fontFamily: fontName}}>{fontName}</option>;
                        } else {
                            return <option key={i} title="Selected font no longer exists, click to select a new one" style={{fontStyle: "italic", color: "red"}}>{fontName}</option>;
                        }
                    })}
                </Dropdown>
            </div>;
        }

        // case "string": {
        //     const value = property as string;
        //     return <div>
        //         <Input
        //             name={fieldName}
        //             type="text"
        //             value={value}
        //             onChange={e => {
        //                 editorDispatch({
        //                     type: "set-doc-x",
        //                     value: {
        //                         type: "set-doc-theme-property",
        //                         value: {
        //                             key: fieldName,
        //                             data: e.target.value,
        //                         },
        //                     },
        //                 });
        //             }}
        //         />
        //     </div>;
        // }

        case "number": {
            const value = property as number;

            return <div>
                <Input
                    step="0.01"
                    min="-9999"
                    max="9999"
                    name={fieldName}
                    type="number"
                    value={value}
                    onChange={e => {
                        const newValue = parseFloatSafe(e.target.value);
                        editorDispatch({
                            type: "set-theme-property",
                            value: {
                                key: fieldName,
                                data: newValue as any,
                            },
                        });
                    }}
                />
            </div>;
        }
    }
};


export default function ThemeEditor () {
    const [appContext, _appDispatch] = useAppState();
    const [editorContext, _editorDispatch] = useEditorState(appContext);

    const theme = editorContext.document.theme;

    if (!theme) throw "no document found";

    const fieldNames = Object.keys(DEFAULT_DOCUMENT_THEME) as (keyof Theme)[];

    const fields = fieldNames.map(fieldName =>
        <li key={fieldName}>
            <Label><span>{fieldName.replace(/(?:-|^)(\w)/g, (_, w) => " " + w.toUpperCase()).trim()}</span><ThemeField fieldName={fieldName}/></Label>
        </li>);

    return <SettingsSection>
        <h1>Theme</h1>
        <SettingsList>{fields}</SettingsList>
    </SettingsSection>;
}
