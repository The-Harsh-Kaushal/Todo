const logout = async (req, res, next) => {
  res.clearCookie("refresh_token");
  res.status(200).json({ msg: "Logout successful" });
};

export { logout };
