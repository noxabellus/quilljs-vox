import { RefObject } from "react";

export type NonUndefined<T> = T extends undefined ? never : T;

export type NonNull = NonNullable<unknown>;
export type Defined = NonUndefined<unknown>;
export type Value = NonNullable<NonUndefined<unknown>>;

export function forceRef<T> (ref: RefObject<T>): NonNullable<NonUndefined<T>> {
    return forceVal(ref.current);
}

export function forceVal<T> (val: T): NonNullable<NonUndefined<T>> {
    if (val === null || val === undefined) {
        console.trace("forced null/undefined value");
        throw "forced null/undefined value";
    }

    return unsafeForceVal<T>(val);
}

export function unsafeForceVal<T> (val: T): NonNullable<NonUndefined<T>> {
    return <NonNullable<NonUndefined<T>>> <unknown> val;
}

export default {
    forceRef,
    forceVal,
    unsafeForceVal,
};
