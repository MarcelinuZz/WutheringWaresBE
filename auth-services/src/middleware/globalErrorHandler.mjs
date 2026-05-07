const globalErrorHandler = (err, req, res, next) => {
    console.error("Auth Service Error:", err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan internal pada server.",
        status: status,
        timestamp: new Date().toISOString()
    });
};

export default globalErrorHandler;
