require("dotenv").config();
const jwt = require("jsonwebtoken");
const { pgPool } = require("../postgresql/dbconstants");

var maxage = 1 * 60 * 60;

const createToken = (usrname) => {
  return jwt.sign({ username: usrname }, process.env.TOKEN_KEY, {
    expiresIn: "1h",
  });
};

function reNewToken(oldToken) {
  // Verify the old token and extract the payload and expiration time
  const decoded = jwt.verify(oldToken, process.env.TOKEN_KEY);
  const payload = { username: decoded.username };

  // Generate a new token with the same payload and expiration time
  const newToken = jwt.sign(payload, process.env.TOKEN_KEY, {
    expiresIn: "1h",
  });

  return newToken;
}

async function authenticateToken(req, res, next) {
  const token = req.header("Authorization"); // Assuming the token is sent in the "Authorization" header

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Assuming you have a 'users' table with a 'username' column in your database
    const client = await pgPool.connect();
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const { rows } = await client.query(userQuery, [decoded.username]);
    await client.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach the decoded payload to the request for use in other middleware or routes
    req.user = decoded;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.error("Error authenticating token:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { createToken, reNewToken, authenticateToken };
