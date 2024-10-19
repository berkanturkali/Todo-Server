class Response {
    constructor(status, message, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    toJson() {
        return {
            status: this.status,
            message: this.message,
            data: this.data
        };
    }
}

module.exports = Response;