function getProfile(req, res) {
  return res.json({ user: req.user });
}

module.exports = { getProfile };
