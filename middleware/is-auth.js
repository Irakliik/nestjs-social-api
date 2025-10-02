import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    const token = req.get('Authorization');

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'somesecretkey');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    res.fullName = decodedToken.fullName;
    next();
};
