class apiResponse {
    constructor(statusCode, message = "Request was successful", data, success) {
        this.res = res;
        this.statusCode = statusCode;
        this.data = data;
        this.success = statusCode < 400
    }

}