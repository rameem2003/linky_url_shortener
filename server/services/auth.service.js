import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import {
  oauthAccountsTable,
  passwordResetTokensTable,
  sessionsTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import crypto from "crypto";

// get user by email
export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

//findUserById
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};

// create user
export const createUser = async (name, email, password) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();

  return user;
};

// hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// update password
export const updatePassword = async (userId, password) => {
  let newPassword = await hashPassword(password);
  return await db
    .update(usersTable)
    .set({ password: newPassword })
    .where(eq(usersTable.id, userId));
};

// verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// generate random code
export const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// insert random Code
export const insertRandomCode = async (userId, token) => {
  db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`(CURRENT_TIMESTAMP)`));
      await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      throw new Error(error);
    }
  });
};

// create email link
export const createEmailLink = (email, token) => {
  const url = new URL(`http://localhost:5000/api/v1/auth/verify-email`);

  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
  // const encodedEmail = encodeURIComponent(email);
  // return `http://localhost:5000/api/v1/auth/verify-email/?token=${token}&email=${encodedEmail}`;
};

// create reset password link
export const createResetPasswordLink = async (userId) => {
  const randomToken = crypto.randomBytes(32).toString("hex");
  let hashToken = crypto.createHash("sha256").update(randomToken).digest("hex");

  await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));
  await db
    .insert(passwordResetTokensTable)
    .values({ userId, tokenHash: hashToken });

  return `http://localhost:5000/api/v1/auth/reset-password/${randomToken}`;
};

// verify reset password token
export const verifyHashResetPassword = async (token) => {
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const [validate] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.tokenHash, hashToken),
        gte(passwordResetTokensTable.expiresAt, sql`(CURRENT_TIMESTAMP)`)
      )
    );

  return validate;
};

// find verify email token
export const findVerificationEmailToken = async (email, token) => {
  return await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(usersTable.email, email),
        eq(verifyEmailTokensTable.token, token),
        gte(verifyEmailTokensTable.expiresAt, sql`(CURRENT_TIMESTAMP)`)
      )
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

// find user and update user name
export const findUserAndUpdateName = async (userId, name) => {
  return db.update(usersTable).set({ name }).where(eq(usersTable.id, userId));
};

// find user and update verify status
export const findUserAndUpdateEmailValidation = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

// clear tokens table
export const clearTokensTable = (userId) => {
  return db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, userId));
};

// clear password reset tokens table
export const clearResetPasswordToken = (userId) => {
  return db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));
};

// create login session
export const createSession = async (userId, ip, userAgent) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();

  return session;
};

// createAccessToken
export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, //   expiresIn: "15m",
  });
};

// createRefreshToken
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, //   expiresIn: "1w",
  });
};

// verifyJWTToken
export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// /findSessionById
export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  return session;
};

// clearUserSession
export const clearUserSession = async (sessionId) => {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};

//refreshTokens
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid session");
    }

    const user = await findUserById(currentSession.userId);

    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);

    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.log(error.message);
  }
};

// authenticateUser
export const authenticateUser = async ({ req, res, user, name, email }) => {
  // we need to create a sessions
  const session = await createSession(
    user.id,
    req.clientIp,
    req.headers["user-agent"]
  );

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

// get user by oauth
export const getUserByOauth = async (provider, email) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isEmailValid: usersTable.isEmailValid,
      providerAccountId: oauthAccountsTable.providerAccountId,
      provider: oauthAccountsTable.provider,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.provider, provider),
        eq(oauthAccountsTable.userId, usersTable.id)
      )
    );

  return user;
};

// link the user with oauth
export async function linkUserWithOauth(
  userId,
  provider,
  providerAccountId,
  avatarUrl
) {
  await db.insert(oauthAccountsTable).values({
    userId,
    provider,
    providerAccountId,
  });

  if (avatarUrl) {
    await db
      .update(usersTable)
      .set({ avatarUrl })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.avatarUrl)));
  }
}

// create user with oauth
export async function createUserWithOauth(
  name,
  email,
  provider,
  providerAccountId,
  avatarUrl
) {
  const user = await db.transaction(async (trx) => {
    const [user] = await trx
      .insert(usersTable)
      .values({
        email,
        name,
        // password: "",
        avatarUrl,
        isEmailValid: true, // we know that google's email are valid
      })
      .$returningId();

    await trx.insert(oauthAccountsTable).values({
      provider,
      providerAccountId,
      userId: user.id,
    });

    return {
      id: user.id,
      name,
      email,
      isEmailValid: true, // not necessary
      provider,
      providerAccountId,
    };
  });

  return user;
}
