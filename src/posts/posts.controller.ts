import { Controller, Post, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PostContent } from 'src/interfaces/post.type';

@Controller('posts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.initializeDraft(
      req.user.tenantId, 
      req.user.userId, 
      dto
    );
  }

  @Patch(':id/autosave')
@UseGuards(JwtAuthGuard, TenantGuard)
async autoSave(
  @Param('id') id: string,
  @Req() req: any,
  @Body() body: { content: PostContent; title?: string }
) {
  return this.postsService.updateDraft(
    req.user.tenantId, 
    id, 
    body
  );
}
}