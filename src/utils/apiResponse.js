class apiResponse {
    constructor(statusCode, message = "Request was successful", data) {
        this.res = res;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400
    }

}