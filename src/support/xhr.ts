import Result from "./result";


export async function toDataURL (url: string): Promise<Result<{data: string}>> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function() {
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result !== "string") {
                    return reject(Result.Error("Failed to convert to data URL"));
                }

                resolve(Result.Success({data: reader.result}));
            };

            reader.onabort = () => {
                reject(Result.Error("Reader aborted"));
            };

            reader.onerror = () => {
                reject(Result.Error("Failed to convert to read data from URL"));
            };

            reader.readAsDataURL(xhr.response);
        };

        xhr.onabort = () => {
            reject(Result.Error("XHR aborted"));
        };

        xhr.onerror = () => {
            reject(Result.Error("Failed to load URL"));
        };

        xhr.open("GET", url);
        xhr.responseType = "blob";

        xhr.send();
    });
}

export default {
    toDataURL,
};
