import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import {
  authenticateUser,
  clearResetPasswordToken,
  clearTokensTable,
  clearUserSession,
  createEmailLink,
  createResetPasswordLink,
  createUser,
  createUserWithOauth,
  findUserAndUpdateEmailValidation,
  findUserAndUpdateName,
  findUserById,
  findVerificationEmailToken,
  generateRandomCode,
  getUserByEmail,
  getUserByOauth,
  hashPassword,
  insertRandomCode,
  linkUserWithOauth,
  updatePassword,
  verifyHashResetPassword,
  verifyPassword,
} from "../services/auth.service.js";
import { getAllLinks } from "./../services/links.service.js";
import {
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  verifyEmailTokenSchema,
  verifyPasswordSchema,
  verifyUserEmailSchema,
  verifyUserNameSchema,
} from "../validator/auth.validator.js";
import { sendEmail } from "../utils/sendEmail.js";
import { OAUTH_EXCHANGE_EXPIRY } from "../config/constants.js";
import { google } from "../utils/oauth/google.js";

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

  if (!user.password) {
    return res.status(400).json({
      success: false,
      msg: "You probably logged in with Google, Try with google login",
    });
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

// get user profile
export const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }
  try {
    const user = await findUserById(req.user.id);
    const allShortLinks = await getAllLinks({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailValid: user.isEmailValid,
        hasPassword: Boolean(user.password),
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        links: allShortLinks,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// edit profile
export const editProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  const { data, error } = verifyUserNameSchema.safeParse(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });
  }
  await findUserAndUpdateName(req.user.id, data.name);

  return res
    .status(200)
    .json({ success: true, msg: "User name updated successfully" });
};

// update user password
export const updateUserPassword = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  const { data, error } = verifyPasswordSchema.safeParse(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });
  }

  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const isPasswordValid = await verifyPassword(
      data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Credentials" });
    }

    await updatePassword(req.user.id, data.newPassword);
    return res
      .status(200)
      .json({ success: true, msg: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};

// user verify email
export const sendEmailForVerification = async (req, res) => {
  if (!req.user || req.user.isEmailValid) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  const randomCode = generateRandomCode();

  await insertRandomCode(req.user.id, randomCode);
  let emailLink = createEmailLink(req.user.email, randomCode);

  let emailBody = `
    <p>Click the link below to verify your email:</p>
    <a href="${emailLink}">${emailLink}</a> or copy and paste it this code <b>${randomCode}</b> into your browser.`;

  await sendEmail(req.user.email, "Email Verification", emailBody);
  res.status(200).json({ success: true, data: emailLink });
};

// verify email token
export const verifyEmailToken = async (req, res) => {
  const { token, email } = req.query;

  const { data, error } = verifyEmailTokenSchema.safeParse({ token, email });

  if (error)
    return res
      .status(400)
      .json({ success: false, msg: "Invalid token or email" });

  const [validate] = await findVerificationEmailToken(data.email, data.token);

  if (!validate) {
    return res
      .status(400)
      .json({ success: false, msg: "Invalid token or email" });
  }

  await findUserAndUpdateEmailValidation(validate.email);
  await clearTokensTable(validate.userId);
  res.status(200).json({ success: true, msg: "Email verified successfully" });
};

// reset password
export const sendResetPasswordEmail = async (req, res) => {
  const { data, error } = verifyUserEmailSchema.safeParse(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });
  }

  const user = await getUserByEmail(data.email);

  if (user) {
    let resetPasswordLink = await createResetPasswordLink(user.id);

    let emailBody = `
      <p>Click the link below to reset your password:</p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a> or copy and paste it this code <b>${resetPasswordLink}</b> into your browser.`;

    await sendEmail(user.email, "Password Reset", emailBody);
    res.status(200).json({ success: true, data: resetPasswordLink });
  } else {
    return res.status(404).json({ success: false, msg: "User not found" });
  }
};

// verify reset password token
export const verifyResetPasswordToken = async (req, res) => {
  const { token } = req.params;

  const passwordResetData = await verifyHashResetPassword(token);

  if (!passwordResetData) {
    return res.status(400).json({ success: false, msg: "Invalid token" });
  }

  res.status(200).json({ success: true, msg: "Token is valid" });
};

// reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;

  const passwordResetData = await verifyHashResetPassword(token);

  if (!passwordResetData) {
    return res.status(400).json({ success: false, msg: "Invalid token" });
  }

  const { data, error } = resetPasswordSchema.safeParse(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, msg: error.errors[0].message });
  }

  await clearResetPasswordToken(passwordResetData.userId);

  await updatePassword(passwordResetData.userId, data.newPassword);

  res.status(200).json({ success: true, msg: "Password reset successfully" });
};

// oauth google
export const oauthGoogle = async (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["openid", "profile", "email"];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);

  const cookieConfig = {
    httpOnly: true,
    secure: true,
    maxAge: OAUTH_EXCHANGE_EXPIRY,
    sameSite: "lax",
  };

  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  res.redirect(url.toString());
};

// google login callback
export const googleLoginCallback = async (req, res) => {
  const { code, state } = req.query;

  const { google_oauth_state, google_code_verifier } = req.cookies;

  if (
    !code ||
    !state ||
    !google_oauth_state ||
    !google_code_verifier ||
    state !== google_oauth_state
  ) {
    return res
      .status(400)
      .json({ success: false, msg: "Invalid google login attempt" });
  }

  let token;
  try {
    token = await google.validateAuthorizationCode(code, google_code_verifier);
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, msg: "Invalid google login attempt" });
  }

  const claims = decodeIdToken(token.idToken());

  const { googleUserId, name, email, picture } = claims;

  // condition 1 : User already exists with oauth link
  // condition 2 : User already exists with same email buu not google o auth link
  // condition 3 : User does not exist

  let user = await getUserByOauth("google", email);

  if (user && !user.providerAccountId) {
    await linkUserWithOauth(user.id, "google", googleUserId, picture);
  }

  if (!user) {
    user = await createUserWithOauth(
      name,
      email,
      "google",
      googleUserId,
      picture
    );
  }

  await authenticateUser({ req, res, user, name, email });

  return res
    .status(200)
    .json({ success: true, msg: "User Google logged in successfully" });
};

// logout user
export const logout = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }
  await clearUserSession(req.user.sessionId);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res
    .status(200)
    .json({ success: true, msg: "User logged out successfully" });
};
