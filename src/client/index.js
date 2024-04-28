import Splash from "./widgets/splash";

Splash(function (file_res) {
    console.log(this, file_res);
    if (file_res.is_success()) {
        console.log(file_res.body);
        this.close();
    } else {
        console.error("failed", file_res.body);
    }
});