import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { loginInputSchema, type LoginInput, type SessionResponse } from '@rental/contracts';
import type { Request, Response } from 'express';
import { readCookie } from '../../common/http/cookies.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';
import { CsrfGuard } from './csrf.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginInputSchema)) input: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionResponse> {
    const session = await this.authService.login(input, request.ip ?? 'unknown');
    this.cookies.set(response, session.sessionToken, session.csrfToken);
    return { user: session.user };
  }

  @Get('session')
  async session(@Req() request: Request): Promise<SessionResponse> {
    const sessionToken = readCookie(request, this.cookies.sessionName());
    if (!sessionToken) throw new UnauthorizedException('Chưa đăng nhập');
    return { user: await this.authService.getUser(sessionToken) };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CsrfGuard)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const sessionToken = readCookie(request, this.cookies.sessionName());
    if (sessionToken) await this.authService.logout(sessionToken);
    this.cookies.clear(response);
  }
}
