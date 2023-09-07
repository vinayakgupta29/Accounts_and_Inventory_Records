require("dotenv").config();
const tokenRouter = require("express").Router();
const jwt = require("jsonwebtoken");

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
  const authHeader = req.headers["authorization"];
  console.info(req.headers);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    await client.connect();
    const db = client.db("Sportyfy");
    const users = db.collection("Users");
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await users.findOne({ _id: decoded.username });
    if (!user)
      return res.status(401).json({ error: "Unauthorized : user not found" });
    req.user = user;
    next();
  } catch (err) {
    console.info("Error during Authentication: ", err);
    return res.status(403).json({ error: "Forbidden: INvalid Token" });
  } finally {
    client.close();
    console.info("Connection to User Closed");
  }
}

tokenRouter.get("/newToken", (req, res) => {
  const oldToken = req.header.Authorization;

  try {
    const newToken = reNewToken(oldToken);
    res.setHeader("Authoization", newToken);
    res.sendStatus(200);
    res.status(200).json({ token: newToken });
  } catch (e) {
    console.error("Error renewing token: ", e);
    res.sendStatus(500);
  }
});

module.exports = { createToken, reNewToken, authenticateToken };
