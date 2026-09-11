import { AuthenticatedRequest, JwtPayload } from "../types";
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LoginDto, RegisterDto, RefreshTokenDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() body: LoginDto, @Request() req: AuthenticatedRequest) {
    const ip = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers ? req.headers["user-agent"] : undefined;
    return this.authService.login(body, ip, userAgent);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async logout(@Request() req: AuthenticatedRequest, @Body() body?: { refreshToken?: string }) {
    let userId: string | undefined = req.user?.id;
    if (!userId && req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const token = req.headers.authorization.replace("Bearer ", "").trim();
      const payload = this.authService.decodeToken(token) as JwtPayload | null;
      userId = payload?.sub;
    }
    return this.authService.logout(userId, body?.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new Error("User not authenticated");
    }
    return this.authService.getProfile(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post("unlock")
  async unlock(@Body() body?: { identifier?: string; email?: string; phone?: string }) {
    const identifier = body?.identifier || body?.email || body?.phone;
    return this.authService.unlockAccount(identifier);
  }
}
