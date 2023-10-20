const adminOrManager = async (user) => {
  if (user.role !== "admin" && user.role !== "manager") {
    console.log("not authorized")
    return false;
  }
};

const adminOnly = async (user) => {
  if (user.role !== "admin") {
    console.log("not authorized")
    return false;
  }
};

module.exports = {
  adminOrManager,
  adminOnly
};
