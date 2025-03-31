const checkRole = (req, allowedRoles) => {
  if (!req.user || !req.user.role) {
    throw new Error('Không có quyền truy cập');
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new Error('Không đủ quyền thực hiện thao tác này');
  }

  return true;
};

module.exports = { checkRole };