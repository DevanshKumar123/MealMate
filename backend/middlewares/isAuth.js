import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token
    if (!token) {
      return res.status(400).json({ message: "Token Not Found" })
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decodeToken.id || decodeToken.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token Not Verify" })
  }
}

export default isAuth
