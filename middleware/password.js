const bcrypt = require('bcrypt');

module.exports = {
  // Function to hash a password
  hashPassword: async function (password, saltRounds = 10) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      return hash;
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  },

  // Function to compare a password with its hash
  comparePassword: async function (plainPassword, hashedPassword) {
    try {
      const match = await bcrypt.compare(plainPassword, hashedPassword);
      return match; // Returns true if matched, false otherwise
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  },
};