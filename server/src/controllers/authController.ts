import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../Repository/UserRepository";
import { IUser } from "../models/User";
import { HttpStatusCode, MESSAGES } from "./constants";

const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, dob, password, preferences } =
      req.body;

    const existingUser = await UserRepository.findByEmailOrPhone(email);
    if (existingUser) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.USER_ALREADY_EXISTS });
    }

    const user = await UserRepository.create({
      firstName,
      lastName,
      email,
      phone,
      dob,
      password,
      preferences: preferences || [],
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(HttpStatusCode.CREATED).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      preferences: user.preferences,
      token,
    });
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await UserRepository.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    const isMatch = await UserRepository.comparePassword(user, password);
    if (!isMatch) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(HttpStatusCode.OK).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      preferences: user.preferences,
      token,
    });
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone ,email } = req.body;
    
    if (!email) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }
    
    const updatedUser = await UserRepository.updateProfile(email, {
      firstName,
      lastName,
      phone,
    });


    if (!updatedUser) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    return res.status(HttpStatusCode.OK).json({
      message: MESSAGES.PROFILE_UPDATED,
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const password = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword, userId } = req.body;

    if (!userId) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.UNAUTHORIZED });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.ALL_FIELDS_REQUIRED });
    }

    if (newPassword.length < 8) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.PASSWORD_MIN_LENGTH });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: MESSAGES.PASSWORDS_DO_NOT_MATCH });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    const isMatch = await UserRepository.comparePassword(user, currentPassword);
    if (!isMatch) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: MESSAGES.CURRENT_PASSWORD_INCORRECT });
    }

    await UserRepository.updatePassword(userId, newPassword);

    res.status(HttpStatusCode.OK).json({ message: MESSAGES.PASSWORD_UPDATED });
  } catch (error) {
    console.error("Password update error:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(HttpStatusCode.OK).json({ message: MESSAGES.LOGGED_OUT });
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: MESSAGES.SERVER_ERROR });
  }
};
