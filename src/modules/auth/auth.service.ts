import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  const secret = process.env.JWT_SECRET || "radiant_autism_super_secret_jwt_key_2026";

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email, role: admin.role, name: admin.name },
    secret,
    { expiresIn: "15d" }
  );

  return { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } };
};

export const verifyAdminToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || "radiant_autism_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secret);
    return decoded as { adminId: string; email: string; role: string; name: string };
  } catch {
    return null;
  }
};
