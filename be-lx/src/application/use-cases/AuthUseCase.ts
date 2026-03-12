import { User, Role } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { ConflictError, UnauthorizedError } from "@domain/errors/AppError";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: Omit<User, "password">; token: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(
      data.email.toLowerCase().trim(),
    );
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user - ALWAYS set role to GUEST for security
    const user = await this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: Role.GUEST,
    });

    // Generate token
    const token = this.generateToken(user);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    // Find user
    const user = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate token
    const token = this.generateToken(user);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || "secret";
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "7d" },
    );
  }

  async verifyToken(
    token: string,
  ): Promise<{ id: string; email: string; role: Role }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
        id: string;
        email: string;
        role: Role;
      };
      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Invalid token");
    }
  }
}
