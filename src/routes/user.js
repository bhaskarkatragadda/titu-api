/* eslint-disable no-underscore-dangle */
const { Router } = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');

const router = Router();

const { signJwtToken, signRefreshToken, verifyRefreshToken } = require('../utility/auth');

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password) return res.status(411).json({ message: 'Invalid Credentials' });
    const userOld = await User.findOne({ email: email });
    if (!userOld) return res.status(409).json({ message: 'User not registered' });
    const isPasswordMatch = await bcrypt.compare(password, userOld.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    // eslint-disable-next-line no-underscore-dangle
    const jwtToken =  await signJwtToken(userOld._id);
    const refreshToken =  await signRefreshToken(userOld._id);
    userOld.refreshToken = refreshToken;
    await userOld.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 60 * 60 * 1000 });
    return res.json({
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
      .isLength({ min: 4, max: 8 }),
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
      res.status(200).json({
        message : "Created"
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/refreshToken', async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.status(401).json({ message: 'Unauthorized' });
    const { refreshToken } = cookies; 
    const userOld = await User.findOne({ refreshToken });
    if (!userOld) return res.status(403).json({ message: 'Forbidden' });
    const payload = verifyRefreshToken(refreshToken);
    if (userOld._id != payload.userId) return res.status(403).json({ message: 'Forbidden' });
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
