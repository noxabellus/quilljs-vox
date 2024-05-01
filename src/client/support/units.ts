import { unsafeForceVal, forceVal } from "./nullable";

// get computed style property
function getStyle (target: HTMLElement, prop: keyof CSSStyleDeclaration): string {
    if ((prop in target.style)  // if it's explicitly assigned, just grab that
    && (!!(target.style[prop]) || target.style[prop] === 0)) {
        // safety: don't know why ts isn't picking up
        // on `prop in target.style` as a type guard
        return unsafeForceVal(target.style[prop]).toString();
    }

    return (
        window
            .getComputedStyle(target, null)
            .getPropertyValue(
                (prop as string)
                    .replace(
                        /([a-z])([A-Z])/,
                        (_, a, b) => a + "-" + b.toLowerCase()
                    )
            )
    );
}

function getNumeric (value: string): number {
    const numeric = value.match(/\d+/);
    if (numeric === null) {
        throw "Invalid property value returned";
    }
    return parseFloat(numeric[0]);
}

function getUnit (value: string): Unit {
    const unit = value.match(/\D+$/);
    if (unit === null) {
        throw "No unit found on property value";
    }
    return unit[0] as Unit;
}

export type Unit
    = "px"
    | "%"
    | "in"
    | "cm"
    | "mm"
    | "pt"
    | "pc"
    | "em"
    | "ex"
    ;
export type UnitName
    = "pixel"
    | "percent"
    | "inch"
    | "cm"
    | "mm"
    | "point"
    | "pica"
    | "em"
    | "ex"
    ;

export type Conversion = number;
export type ConversionMap = Record<UnitName, Conversion>;

export function getUnits (target: HTMLElement, prop: keyof CSSStyleDeclaration): ConversionMap;
export function getUnits (target: HTMLElement, prop: keyof CSSStyleDeclaration, returnUnit: Unit): Conversion;

// get object with units
export default function getUnits (target: HTMLElement, prop: keyof CSSStyleDeclaration, returnUnit?: Unit): Conversion | ConversionMap {
    const baseline = 100;  // any number serves

    const map: Record<UnitName, Unit> = {  // list of all units and their identifying string
        pixel: "px",
        percent: "%",
        inch: "in",
        cm: "cm",
        mm: "mm",
        point: "pt",
        pica: "pc",
        em: "em",
        ex: "ex"
    };

    const factors = {} as ConversionMap;  // holds ratios
    const units = {} as ConversionMap;  // holds calculated values

    const value = getStyle(target, prop);  // get the computed style value

    const numeric = getNumeric(value);
    const unit = getUnit(value);

    let activeMap: UnitName | null = null;  // a reference to the map key for the existing unit
    for (const name in map) {
        if(map[name as UnitName] == unit){
            activeMap = name as UnitName;
            break;
        }
    }

    if (!activeMap) { // if existing unit isn't in the map, throw an error
        throw "Unit not found in map";
    }

    let singleUnit: UnitName | null = null;  // return object (all units) or string (one unit)?
    if (returnUnit && (typeof returnUnit == "string")) {  // if user wants only one unit returned, delete other maps
        for (const n in map) {
            const name = n as UnitName;
            if (map[name as UnitName] == returnUnit) {
                singleUnit = name;
                continue;
            }
            delete map[name];
        }
    }

    const temp = document.createElement("div");  // create temporary element
    temp.style.overflow = "hidden";  // in case baseline is set too low
    temp.style.visibility = "hidden";  // no need to show it

    const parent = forceVal(target.parentNode);
    parent.appendChild(temp);    // insert it into the parent for em and ex

    for (const n in map) {  // set the style for each unit, then calculate it's relative value against the baseline
        const name = n as UnitName;
        temp.style.width = baseline + map[name];
        factors[name] = baseline / temp.offsetWidth;
    }

    for (const n in map) {  // use the ratios figured in the above loop to determine converted values
        const name = n as UnitName;
        units[name] = (numeric * (factors[name] * factors[activeMap]));
    }

    parent.removeChild(temp);  // clean up

    return (singleUnit !== null ? units[singleUnit] : units);
}
