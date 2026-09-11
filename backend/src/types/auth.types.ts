export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  role: string;
  organizationId: string;
  branchId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginResult {
  user: {
    id: string;
    email?: string;
    phone?: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
  tokens: TokenResponse;
}

export type SystemRole =
  "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "MANAGER" | "ACCOUNTANT";
