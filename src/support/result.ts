import { NonNull } from "./nullable";


export type Status = "success" | "failure" | "error";

export type Success<T> = {
    status: "success",
    body: T,
}

export type Failure = {
    status: "failure",
}

export type Error<E> = {
    status: "error",
    body: E,
}

export type Result<T, E extends NonNull = string> = Success<T> | Failure | Error<E>;

export const Result = {
    Success<T>(body: T): Success<T> {
        return { status: "success", body };
    },

    Failure(): Failure {
        return { status: "failure" };
    },

    Error<E extends NonNull>(body: E): Error<E> {
        return { status: "error", body };
    },

    isSuccess<T, E extends NonNull>(res: Result<T, E>): res is Success<T> {
        return res.status === "success";
    },

    notSuccess<T, E extends NonNull>(res: Result<T, E>): res is Failure | Error<E> {
        return res.status !== "success";
    },

    isFailure<T, E extends NonNull>(res: Result<T, E>): res is Failure {
        return res.status === "failure";
    },

    isError<T, E extends NonNull>(res: Result<T, E>): res is Error<E> {
        return res.status === "error";
    },

    problemMessage<T, E extends NonNull>(res: Result<T, E>): string {
        if (Result.isFailure(res)) {
            return "unknown failure";
        } else if (Result.isError(res)) {
            return res.body.toString();
        } else {
            return "not a failure";
        }
    },
};

export default Result;
