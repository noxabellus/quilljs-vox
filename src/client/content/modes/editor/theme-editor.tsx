import React, { useContext } from "react";

import { parseFloatSafe, parseIntSafe } from "Support/number";

import { Color, Dimensions, Length, THEME_UNITS, Theme, lengthUnit, lengthConvert, propertyType, themeValue, DEFAULT_DOCUMENT_THEME } from "Document/theme";

import Dropdown from "Elements/dropdown";
import Input from "Elements/input";
import Label from "Elements/label";

import AppState, { useAppState } from "../../app/state";




const ThemeField = ({fieldName}: {fieldName: keyof Theme}) => {
    const [appState, appDispatch] = useAppState();

    const theme = appState.data.document.current?.theme;
    if (!theme) throw "no document found";

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

                appDispatch({
                    type: "set-doc-x",
                    value: {
                        type: "set-doc-theme-property",
                        value: {
                            key: fieldName,
                            data: { [newUnit]: converted } as Theme[typeof fieldName],
                        },
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
                        appDispatch({
                            type: "set-doc-x",
                            value: {
                                type: "set-doc-theme-property",
                                value: {
                                    key: fieldName,
                                    data: { [unit]: value } as Theme[typeof fieldName],
                                },
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

                        appDispatch({
                            type: "set-doc-x",
                            value: {
                                type: "set-doc-theme-property",
                                value: {
                                    key: fieldName,
                                    data: newDims,
                                },
                            },
                        });
                    };

                    return <Label key={dimIndex}>
                        {dimNames[dimIndex]}
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
                                    appDispatch({
                                        type: "set-doc-x",
                                        value: {
                                            type: "set-doc-theme-property",
                                            value: {
                                                key: fieldName,
                                                data: newDims,
                                            },
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
                        {compNames[compIndex]}
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
                                appDispatch({
                                    type: "set-doc-x",
                                    value: {
                                        type: "set-doc-theme-property",
                                        value: {
                                            key: fieldName,
                                            data: newComps,
                                        },
                                    },
                                });
                            }}
                        />
                    </Label>;
                })}
            </div>;
        }

        case "string": {
            const value = property as string;

            return <div>
                <Input
                    name={fieldName}
                    type="text"
                    value={value}
                    onChange={e => {
                        appDispatch({
                            type: "set-doc-x",
                            value: {
                                type: "set-doc-theme-property",
                                value: {
                                    key: fieldName,
                                    data: e.target.value,
                                },
                            },
                        });
                    }}
                />
            </div>;
        }

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
                        appDispatch({
                            type: "set-doc-x",
                            value: {
                                type: "set-doc-theme-property",
                                value: {
                                    key: fieldName,
                                    data: newValue as any,
                                },
                            },
                        });
                    }}
                />
            </div>;
        }
    }
};


export default function ThemeEditor () {
    const appContext = useContext(AppState.Context);

    const theme = appContext.data.document.current?.theme;

    if (!theme) throw "no document found";

    const fieldNames = Object.keys(DEFAULT_DOCUMENT_THEME) as (keyof Theme)[];

    const fields = fieldNames.map(fieldName =>
        <li key={fieldName}>
            <Label>{fieldName.replace(/(?:-|^)(\w)/g, (_, w) => " " + w.toUpperCase())}<ThemeField fieldName={fieldName}/></Label>
        </li>);

    return <>
        <h1>Theme</h1>
        <ul>{fields}</ul>
    </>;
}
