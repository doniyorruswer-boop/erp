import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("FATAL SECURITY ERROR: JWT_SECRET environment variable is missing!");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload & { firstName?: string; lastName?: string }) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException("Token yaroqsiz!");
    }
    return {
      id: payload.sub,
      phone: payload.phone,
      role: payload.role,
      organizationId: payload.organizationId || null,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
