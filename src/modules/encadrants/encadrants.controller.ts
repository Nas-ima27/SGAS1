import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EncadrantsService } from './encadrants.service';
import { CreateEncadrantDto } from './dto/create-encadrant.dto';
import { UpdateEncadrantDto } from './dto/update-encadrant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

@Controller('encadrants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncadrantsController {
  constructor(private readonly encadrantsService: EncadrantsService) {}

  /** GET /encadrants — Admin uniquement (EncadrantsPage, §6.3 frontend). */
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.encadrantsService.findAll();
  }

  /**
   * GET /encadrants/:id
   * Admin : consultation libre (EncadrantDetailPage).
   * Encadrant : uniquement sa propre fiche (utile pour son propre
   * tableau de bord, §6.10 frontend).
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.ENCADRANT && req.user.id !== id) {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre fiche.');
    }
    return this.encadrantsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateEncadrantDto) {
    return this.encadrantsService.create(dto);
  }

  /** PATCH /encadrants/:id — Admin uniquement, y compris le toggle compteActif (§4). */
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEncadrantDto) {
    return this.encadrantsService.update(id, dto);
  }
}