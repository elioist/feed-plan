import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createTagSchema,
  idParamSchema,
  reorderItemsSchema,
  tagListQuerySchema,
  updateTagSchema,
  type CreateTagInput,
  type IdParam,
  type ReorderItemsInput,
  type Tag,
  type TagListQuery,
  type UpdateTagInput,
} from '@feed-plan/shared';
import { AccessGuard } from '../auth/access.guard.js';
import { ACCESS_ACTIONS } from '../auth/access-actions.js';
import { RequireAccess } from '../auth/access.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { TagsService } from './tags.service.js';

@Controller('tags')
@UseGuards(JwtAuthGuard, AccessGuard)
@RequireAccess(ACCESS_ACTIONS.tagsManage)
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(tagListQuerySchema)) query: TagListQuery): Promise<Tag[]> {
    return this.tags.list(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTagSchema)) body: CreateTagInput): Promise<Tag> {
    return this.tags.create(body);
  }

  @Patch('reorder')
  async reorder(@Body(new ZodValidationPipe(reorderItemsSchema)) body: ReorderItemsInput) {
    await this.tags.reorder(body.ids);
    return { ok: true };
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParam,
    @Body(new ZodValidationPipe(updateTagSchema)) body: UpdateTagInput,
  ): Promise<Tag> {
    return this.tags.update(params.id, body);
  }

  @Delete(':id')
  async remove(@Param(new ZodValidationPipe(idParamSchema)) params: IdParam) {
    await this.tags.remove(params.id);
    return { ok: true };
  }
}
