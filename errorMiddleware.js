export function errorMiddleware(error, req, res, next) {
    var statusCode = error.statusCode || 500;
    statusCode = error.message.includes("not found") ? 404 : statusCode;
    console.error(error.stack);
    res.status(statusCode).json({ error: error.message }); // Send JSON response
}