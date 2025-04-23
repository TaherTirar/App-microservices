const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(403).json({ message: 'token is required' });
        }
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'token is required' });
        }
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        req.userData = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'ooops Authentication' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ message: 'token is required' });
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Authentication failed' });
            }
            req.userData = decodedToken;
            if (!req.userData.isAdmin) {
                return res.status(403).json({ message: 'Admin' });
            }
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: 'Authentication' });
    }
};

module.exports = { isAuth, isAdmin };
