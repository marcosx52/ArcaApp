import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new UnauthorizedException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        fullName: dto.fullName.trim(),
        passwordHash,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          status: user.status,
        },
        accessToken,
      },
      message: 'Usuario registrado correctamente',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { companies: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          status: user.status,
          companies: user.companies.map((item) => ({
            companyId: item.companyId,
            role: item.role,
            isDefault: item.isDefault,
          })),
        },
        accessToken,
      },
      message: 'Login correcto',
    };
  }

  async me(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { companies: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        companies: user.companies.map((item) => ({
          companyId: item.companyId,
          role: item.role,
          isDefault: item.isDefault,
        })),
      },
      message: 'Perfil actual',
    };
  }
}
