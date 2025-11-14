import jwt from "jsonwebtoken";

const genToken = async (userId) => {
  try {
    if (!userId) {
      throw new Error("userId is required");
    }
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

export default genToken;
