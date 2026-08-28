function adminAuth(req, res, next) {

    const username = req.headers["x-admin-username"];
    const password = req.headers["x-admin-password"];

    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "AIQUESTX@123";

    // Allow configured username/password or legacy defaults
    const isUsernameValid = (
        username === validUsername ||
        username === "admin" ||
        username === "aiquestx_admin"
    );

    const isPasswordValid = (
        password === validPassword ||
        password === "AIQUESTX@123" ||
        password === "AI QUESTX@123" ||
        password === "admin123"
    );

    if (!isUsernameValid || !isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    next();
}

module.exports = adminAuth;