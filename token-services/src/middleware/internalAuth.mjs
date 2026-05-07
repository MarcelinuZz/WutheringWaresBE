const internalAuth = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or missing internal API key.',
        });
    }

    next();
};

export default internalAuth;
