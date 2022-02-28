/* eslint-disable no-underscore-dangle */
const { Router } = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');

const router = Router();

const { signJwtToken, signRefreshToken, verifyRefreshToken } = require('../utility/auth');

router.post('/login', async (req, res, next) => {
  try {
    const userOld = await User.findOne({ email: req.body.email });
    if (!userOld) res.status(401).json({ message: 'User not registered' });
    const isPasswordMatch = bcrypt.compare(req.body.password, userOld.password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: 'Invalid Credentials' });
    }
    // eslint-disable-next-line no-underscore-dangle
    const jwtToken = await signJwtToken(userOld._id);
    const refreshToken = await signRefreshToken(userOld._id);
    userOld.refreshToken = refreshToken;
    await userOld.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 7 * 60 * 60 * 1000 });
    res.status(200).json({
      accessToken: jwtToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/register',
  [
    check('email', 'Email is not valid').not().isEmpty().isEmail(),
    check('password', 'Password should be between 5 to 8 characters long')
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 8 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { res.status(422).json(errors.array()); }

      const userOld = await User.findOne({ email: req.body.email });
      if (userOld) {
        res.status(409).json({ message: `${userOld.email} is already been registered` });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userNew = new User({
        email: req.body.email,
        password: hashedPassword,
      });

      const userSaved = await userNew.save();
      // eslint-disable-next-line no-underscore-dangle
      const jwtToken = await signJwtToken(userSaved._id);
      const refreshToken = await signRefreshToken(userSaved._id);
      userSaved.refreshToken = refreshToken;
      await userSaved.save();
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 7 * 60 * 60 * 1000 });
      res.status(200).json({
        accessToken: jwtToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/refreshToken', async (req, res, next) => {
  try {
    const { cookies } = req;
    if (!cookies?.refreshToken) res.status(401).json({ message: 'Unauthorized' });
    const { refreshToken } = cookies;
    const userOld = await User.findOne({ refreshToken });
    if (!userOld) res.status(403).json({ message: 'Forbidden' });
    const payload = verifyRefreshToken(refreshToken);
    if (userOld._id !== payload.userId) res.status(403).json({ message: 'Forbidden' });
    const jwtToken = await signJwtToken(userOld._id);
    const refreshTokenNew = await signRefreshToken(userOld._id);
    userOld.refreshToken = refreshTokenNew;
    await userOld.save();
    res.cookie('refreshToken', refreshTokenNew, { httpOnly: true, sameSite: 'None', maxAge: 7 * 60 * 60 * 1000 });
    res.status(200).json({
      accessToken: jwtToken,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
