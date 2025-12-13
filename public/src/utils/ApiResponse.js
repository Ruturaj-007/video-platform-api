class ApiResponse {
    constructor (statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data // Stores the HTTP code.
        this.message = message
        this.success = statusCode < 400
    }
}