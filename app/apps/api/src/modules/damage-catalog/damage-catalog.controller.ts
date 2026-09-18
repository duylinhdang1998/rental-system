import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  damageItemInputSchema,
  damageItemListQuerySchema,
  damageItemUpdateSchema,
  type DamageItemInput,
  type DamageItemListQuery,
  type DamageItemUpdateInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { DamageCatalogService } from './damage-catalog.service.js';

/** No DELETE on purpose: items referenced by old charges are deactivated, never removed. */
@Controller('catalog/damage-items')
@UseGuards(AuthenticationGuard)
export class DamageCatalogController {
  constructor(private readonly service: DamageCatalogService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(damageItemListQuerySchema)) query: DamageItemListQuery,
    @Req() request: ContextRequest,
  ) {
    return this.service.list(request.authenticatedUser!, query.includeInactive);
  }

  @Post()
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  create(
    @Body(new ZodValidationPipe(damageItemInputSchema)) input: DamageItemInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.create(input, request.authenticatedUser!);
  }

  @Patch(':id')
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(damageItemUpdateSchema)) input: DamageItemUpdateInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.update(id, input, request.authenticatedUser!);
  }
}
