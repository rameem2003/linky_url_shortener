import {
  authenticateUser,
  clearUserSession,
  createUser,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/auth.service.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validator/auth.validator.js";

// register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // validate user data
  const { data, error } = registerUserSchema.safeParse({
    name,
    email,
    password,
  });

  if (error)
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });

  // check user exist
  const userExist = await getUserByEmail(data.email);

  if (userExist) {
    return res.status(400).json({ success: false, msg: "User already exist" });
  }

  // hash password
  const hashedPassword = await hashPassword(data.password);

  // create the user
  const user = await createUser(data.name, data.email, hashedPassword);

  return res
    .status(200)
    .json({ success: true, msg: "User created successfully", data: user });
};

// login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = loginUserSchema.safeParse({ email, password });

  if (error)
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });

  const user = await getUserByEmail(data.email);

  if (!user) {
    return res.status(400).json({ success: false, msg: "Invalid Credentials" });
  }

  const isPasswordValid = await verifyPassword(data.password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ success: false, msg: "Invalid Credentials" });
  }

  await authenticateUser({ req, res, user });

  return res
    .status(200)
    .json({ success: true, msg: "User logged in successfully" });
};

// logout user
export const logout = async (req, res) => {
  await clearUserSession(req.user.sessionId);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res
    .status(200)
    .json({ success: true, msg: "User logged out successfully" });
};
