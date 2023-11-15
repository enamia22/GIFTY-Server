const adminOrManager = async (user) => {
  if (user.role !== "admin" && user.role !== "manager") {
    return false;
  }else{
    return true;
  }
};

const adminOnly = async (user) => {
  if (user.role !== "admin") {
    return false;
  }else{
    return true;
  }
};

module.exports = {
  adminOrManager,
  adminOnly
};
