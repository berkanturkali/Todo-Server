const Response = require("./response");

class ErrorResponse extends Response {
    constructor(message, statusCode, data) {
        super("error", message, data)
        this.statusCode = statusCode
    }
}

module.exports = ErrorResponse;