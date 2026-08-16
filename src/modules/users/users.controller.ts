import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

/**
 * §2 : gestion des comptes internes Admin/RH — Admin uniquement.
 * POST est en plus réservé aux comptes isSuperAdmin=true (décision prise
 * en conversation) : un "Gestionnaire" (isSuperAdmin=false) a le rôle
 * Admin et peut donc gérer Encadrant/Stagiaire normalement, mais ne peut
 * pas créer de nouveaux comptes internes.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUtilisateurDto, @Req() req: RequestWithUser) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException(
        'Seul un administrateur principal peut créer de nouveaux comptes internes.',
      );
    }
    return this.usersService.create(dto);
  }
}