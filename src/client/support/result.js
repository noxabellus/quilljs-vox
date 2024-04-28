export default class Result {
    constructor(status, body) {
        this.status = status;
        this.body = body;
    }

    static Success(body) {
        return new Result("success", body);
    }

    static Failure() {
        return new Result("failure", null);
    }

    static Error(body) {
        return new Result("error", body);
    }

    is_success() {
        return this.status === "success";
    }

    not_success() {
        return this.status !== "success";
    }

    is_failure() {
        return this.status === "failure";
    }

    is_error() {
        return this.status === "error";
    }
}