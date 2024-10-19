const Response = require("./response");

class SuccessResponse extends Response {
    constructor(message, data) {
        super("success", message, data);
    }
}

module.exports = SuccessResponse;