// src/repository/AuthRepository.ts
import User from "../models/User";
import { IUser } from "../interfaces/UserInterface";
import { sign } from "jsonwebtoken"; // Import JWT sign function
import { JWT_SECRET } from "../config"; // Ensure you have a JWT_SECRET in your config

export class AuthRepository {
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: Omit<IUser, "password"> }> {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      // Check if user exists and password matches
      if (!user || !(await user.comparePassword(password))) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

      return { token, user };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async register({
    first_name,
    last_name,
    phone,
    email,
    password,
    role,
  }: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    role: string;
  }): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Create new user
      const newUser = new User({
        first_name,
        last_name,
        phone,
        email,
        password,
        role
      });

      // Save new user to database
      await newUser.save();
      return newUser;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  async forgotPassword({ email }: { email: string }): Promise<boolean> {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      // Logic to handle password reset (e.g., sending email with reset link)
      // This would typically involve generating a reset token and sending it via email

      return true; // Indicate that the forgot password process was initiated successfully
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Forgot password failed"
      );
    }
  }

  async resetPassword({
    token,
    password,
  }: {
    token: string;
    password: string;
  }): Promise<boolean> {
    try {
      // Logic to validate the token (e.g., checking if it matches a stored token)
      // Assuming token is valid, we will find the user and update the password

      // Example: Find user by token logic (you might want to implement this based on your application logic)
      const user = await User.findOne({
        /* your logic to find the user by token */
      });
      if (!user) {
        throw new Error("Invalid token");
      }

      // Update user password
      user.password = password; // Ensure the password is hashed in the User model's pre-save hook
      await user.save();

      return true; // Indicate success
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Reset password failed"
      );
    }
  }

  async logout({ userId }: { userId: string }): Promise<boolean> {
    try {
      // Implement your logout logic (e.g., invalidate the token)
      // Here we assume the user is logged out successfully

      return true; // Indicate that logout was successful
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Logout failed");
    }
  }
}