import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ message: "Token not valid" });
        }

        // Attach userId to request
        req.userId = decodedToken.userId;
        next();

    } catch (error) {
        console.error("isAuth error:", error);
        return res.status(500).json({ message: "Authentication error" });
    }
};

export default isAuth;
