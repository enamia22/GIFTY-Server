const adminOrManager = async (user) => {
  if (user.role !== "admin" && user.role !== "manager") {
    console.log("not authorized")
    return false;
  }else{
    console.log("authorized")
    return true;
  }
};

const adminOnly = async (user) => {
  if (user.role !== "admin") {
    console.log("not authorized")
    return false;
  }else{
    console.log("authorized")
    return true;
  }
};

module.exports = {
  adminOrManager,
  adminOnly
};
