const Users = require("../models/user");

module.exports = async (username, password, req, res) => {
  const user = await Users.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).send("Invalid credentials for user");
  }

  // Set session or token logic for user
  req.session.user = user;
  res.redirect(`/student/${studentId}/approval`);
};
