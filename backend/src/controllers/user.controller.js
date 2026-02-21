const logout = async (req, res, next) => {
  const { id } = req.user;
  const token = req.cookies.refresh_token;
  try {
    const user = await userSchema.findById(id);
    const index = user.refresh_token.findIndex((value) => value == token);
    user.refresh_token.splice(index, 1);
    await user.save();
  } catch (err) {
    console.log(err);
  }
  res.clearCookie("refresh_token");
  res.status(200).json({ msg: "Logout successful" });
};

export { logout };
