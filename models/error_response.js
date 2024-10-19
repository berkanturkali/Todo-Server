const Response = require("./response");

class ErrorResponse extends Response {
    constructor(message, data) {
        super("error", message, data)
    }
}

module.exports = ErrorResponse;