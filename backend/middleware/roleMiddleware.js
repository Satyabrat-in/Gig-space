// Usage: roleCheck("employer") or roleCheck("admin")
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(" or ")} can do this.`,
      });
    }
    next();
  };
};

module.exports = { roleCheck };