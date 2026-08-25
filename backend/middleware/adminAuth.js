require("dotenv").config();
const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME;

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;


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