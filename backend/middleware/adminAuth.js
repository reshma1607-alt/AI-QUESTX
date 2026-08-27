const ADMIN_USERNAME = "aiquestx_admin";
const ADMIN_PASSWORD = "AI QUESTX@123";

function adminAuth(req, res, next) {

    const username =
        req.headers["x-admin-username"];

    const password =
        req.headers["x-admin-password"];

    if (
        username !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    next();
}

module.exports = adminAuth;