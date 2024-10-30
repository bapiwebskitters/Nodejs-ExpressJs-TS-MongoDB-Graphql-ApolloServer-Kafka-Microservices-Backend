// src/controllers/AuthController.ts
import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";
import { IUser } from "../interfaces/UserInterface";

class AuthController {
  private authRepository: AuthRepository;
  private userRepository: UserRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
  }

  // Helper function for success responses
  private successResponse(data: any, message: string = "Operation successful") {
    return {
      status: "success",
      message,
      data,
    };
  }

  // Helper function for error responses
  private errorResponse(message: string) {
    return {
      status: "error",
      message,
    };
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ status: string; message: string; data?: IUser }> {
    try {
      const { token, user } = await this.authRepository.login({
        email,
        password,
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const respData = {
        user:user,
      token:token
      }

      return this.successResponse(respData, "User login successful");

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          this.errorResponse("Login failed: " + error.message).message
        );
      } else {
        throw new Error(
          this.errorResponse("Login failed: An unknown error occurred.").message
        );
      }
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
  }): Promise<{ status: string; message: string; data?: any }> {
    try {
      // Check if the user already exists
      const existingUser = await this.userRepository.getByField({
        email: email,
      });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Register new user
      const saveUser = await this.authRepository.register({
        first_name,
        last_name,
        phone,
        email,
        password,
        role,
      });

      return this.successResponse(saveUser, "User registered successfully");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          this.errorResponse("Registration failed: " + error.message).message
        );
      } else {
        throw new Error(
          this.errorResponse(
            "Registration failed: An unknown error occurred."
          ).message
        );
      }
    }
  }

  async forgotPassword({ email }: { email: string }): Promise<boolean> {
    try {
      const result = await this.authRepository.forgotPassword({ email });
      if (!result) {
        throw new Error("Could not initiate password recovery");
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          this.errorResponse("Forgot password failed: " + error.message).message
        );
      } else {
        throw new Error(
          this.errorResponse(
            "Forgot password failed: An unknown error occurred."
          ).message
        );
      }
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
      const result = await this.authRepository.resetPassword({
        token,
        password,
      });
      if (!result) {
        throw new Error("Could not reset password");
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          this.errorResponse("Reset password failed: " + error.message).message
        );
      } else {
        throw new Error(
          this.errorResponse(
            "Reset password failed: An unknown error occurred."
          ).message
        );
      }
    }
  }

  async logout({ userId }: { userId: string }): Promise<boolean> {
    try {
      const result = await this.authRepository.logout({ userId });
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          this.errorResponse("Logout failed: " + error.message).message
        );
      } else {
        throw new Error(
          this.errorResponse(
            "Logout failed: An unknown error occurred."
          ).message
        );
      }
    }
  }
}

export default new AuthController();
