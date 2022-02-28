const JWT = require('jsonwebtoken');

const signJwtToken = async (userId) => {
  try {
    const payload = {
      userId,
    };
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: '1h',
      issuer: 'titutasks.com',
    };
    const token = JWT.sign(payload, secret, options);
    return token;
  } catch (error) {
    throw new Error('INTERNAL_ERROR');
  }
};

// eslint-disable-next-line consistent-return
const verifyAccessToken = (req, res, next) => {
  if (!req.header('jwt_auth')) return res.sendStatus(401);
  const token = req.header('jwt_auth');
  try {
    const payload = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    const message = error.name === 'JsonWebTokenError' ? 'Unauthorized' : error.message;
    res.status(401).json({
      message,
    });
  }
};

const signRefreshToken = async (userId) => {
  try {
    const payload = {
      userId,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: '7h',
      issuer: 'titutasks.com',
    };
    const token = JWT.sign(payload, secret, options);
    return token;
  } catch (error) {
    throw new Error('INTERNAL_ERROR');
  }
};

const verifyRefreshToken = (token) => {
  try {
    const payload = JWT.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return payload;
  } catch (error) {
    throw new Error('INTERNAL_ERROR');
  }
};

module.exports = {
  signJwtToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
