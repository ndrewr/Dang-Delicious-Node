const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are logged in.'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  // first check if User is authenticated
  if (req.isAuthenticated()) {
    next();
  }

  else {
    req.flash('error', 'Please login first to continue.');
    res.redirect('/login');
  }
}

exports.forgot = async (req, res) => {
  // 1. see if user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // security question: OK to tell whether email acct exists?
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }
  // 2. set reset tokens and expiry on their acct
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 36000000;
  await user.save();
  // 3. send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
  // 4. redirect to login page
  res.redirect('/login')
}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset token has expired or is invalid');
    return res.redirect('/login');
  }

  res.render('reset', { title: 'Reset Password' });
}

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // good to go, keep going
    return;
  }

  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })

  if (!user) {
    req.flash('error', 'Password reset token has expired or is invalid');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  
  await setPassword(req.body.password);
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  
  const updatedUser = await user.save();

  await req.login(updatedUser);

  req.flash('success', 'Password reset! You are logged in.');
  res.redirect('/');
}
