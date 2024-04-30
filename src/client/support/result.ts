export type Status = "success" | "failure" | "error";

export type Success<T> = {
    status: "success"
    body: T
}

export type Failure = {
    status: "failure"
}

export type Error<E> = {
    status: "error"
    body: E
}
export type Result<T, E = string> = Success<T> | Failure | Error<E>;

export const Result = {
    Success<T>(body: T): Success<T> {
        return { status: "success", body };
    },

    Failure(): Failure {
        return { status: "failure" };
    },

    Error<E>(body: E): Error<E> {
        return { status: "error", body };
    },

    is_success<T, E>(res: Result<T, E>): res is Success<T> {
        return res.status === "success";
    },

    not_success<T, E>(res: Result<T, E>): res is Failure | Error<E> {
        return res.status !== "success";
    },

    is_failure<T, E>(res: Result<T, E>): res is Failure {
        return res.status === "failure";
    },

    is_error<T, E>(res: Result<T, E>): res is Error<E> {
        return res.status === "error";
    },
    
    unsuccessful_message<T, E>(res: Result<T, E>): string {
        if (Result.is_failure(res)) {
            return "unknown failure";
        } else if (Result.is_error(res)) {
            return res.body.toString();
        } else {
            return "not a failure";
        }
    }
};

export default Result;