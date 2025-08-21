import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";

export class UserRepository {
  static async findByEmailOrPhone(emailOrPhone: string): Promise<IUser | null> {
    return await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  static async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  static async create(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    password: string;
    preferences?: string[];
  }): Promise<IUser> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    return await User.create({
      ...userData,
      password: hashedPassword,
    });
  }

  static async updateProfile(
    email: string,
    updates: { firstName: string; lastName: string; phone: string }
  ): Promise<IUser | null> {
    const user = await User.findOne({email});
    if (!user) return null;
    user.firstName = updates.firstName;
    user.lastName = updates.lastName;
    user.phone = updates.phone;
    return await user.save();
  }

  static async updatePassword(userId: string, newPassword: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    return await user.save();
  }

  static async comparePassword(user: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

   static async updatePreferences(userId: string, preferences: string[]): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    );
  }
}