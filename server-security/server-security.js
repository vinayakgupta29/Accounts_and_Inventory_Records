const cleanAlphanumeric = (value) => {
  return value.trim().replace(/[^A-Za-z0-9]/g, "");
};

module.exports = { cleanAlphanumeric };
