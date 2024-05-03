import { useContext } from "react";

import AppState from "../../app/state";
import Block from "../../basic/block";
import { Color, Dimensions, Length, THEME_UNITS, Theme, lengthUnit, propertyType } from "../../../support/document-theme";
import Dropdown from "../../basic/dropdown";
import convertUnit from "../../../support/units";
import Input from "../../basic/input";


export default function ThemeEditor () {
    const appContext = useContext(AppState.Context);
    const appDispatch = useContext(AppState.Dispatch);

    const theme = appContext.data.document.current?.theme;

    if (!theme) throw "no document found";

    const fieldNames = Object.keys(theme) as (keyof Theme)[];


    const ThemeField = ({fieldName}: {fieldName: keyof Theme}) => {
        const property = theme[fieldName];

        switch (propertyType(property)) {
            case "length": {
                const prop = property as Length;
                const unit = lengthUnit(prop);
                const value = (prop as any)[unit] as number;

                const changeUnit = (i: number) => {
                    const newUnit = THEME_UNITS[i];
                    const converted = convertUnit(theme, value, unit, newUnit);

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
                        min="-9999"
                        max="9999"
                        name={fieldName}
                        type="number"
                        value={value}
                        onChange={e => {
                            const value = parseFloat(e.target.value);
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
                        onChanged={changeUnit}
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
                            const converted = convertUnit(theme, value, unit, newUnit);

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

                        return <label key={dimIndex}>
                            {dimNames[dimIndex]}
                            <div>
                                <Input
                                    min="-9999"
                                    max="9999"
                                    name={`${fieldName}-${dimIndex}`}
                                    type="number"
                                    value={value}
                                    onChange={e => {
                                        const value = parseFloat(e.target.value);
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
                                    onChanged={changeUnit}
                                >
                                    {THEME_UNITS.map((unit, i) => <option key={i}>{unit}</option>)}
                                </Dropdown>
                            </div>
                        </label>;
                    })}
                </div>;
            }

            case "color": {
                const compNames = ["r", "g", "b"];
                const comps = property as Color;

                return <div>
                    {comps.map((comp, compIndex) => {
                        return <label key={compIndex}>
                            {compNames[compIndex]}
                            <Input
                                min="0"
                                max="255"
                                name={`${fieldName}-${compNames[compIndex]}`}
                                type="number"
                                value={comp}
                                onChange={e => {
                                    const value = parseFloat(e.target.value);
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
                        </label>;
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
                        min="-9999"
                        max="9999"
                        name={fieldName}
                        type="number"
                        value={value}
                        onChange={e => {
                            const newValue = parseFloat(e.target.value);
                            appDispatch({
                                type: "set-doc-x",
                                value: {
                                    type: "set-doc-theme-property",
                                    value: {
                                        key: fieldName,
                                        data: newValue,
                                    },
                                },
                            });
                        }}
                    />
                </div>;
            }
        }
    };



    const fields = fieldNames.map(fieldName =>
        <li key={fieldName}>
            <label htmlFor={fieldName}>{fieldName}<ThemeField fieldName={fieldName}/></label>
        </li>);

    return <Block>
        <h1>Theme</h1>
        <ul>{fields}</ul>
    </Block>;
}
