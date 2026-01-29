import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { TenantBaseService } from '../common/services/tenant-base.service';
import slugify from 'slugify';
import * as crypto from 'crypto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostContent } from 'src/interfaces/post.type';
import { calculateReadingTime } from 'src/lib/post-helper';

@Injectable()
export class PostsService extends TenantBaseService<PostDocument> {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  async initializeDraft(tenantId: string, userId: string, dto: CreatePostDto): Promise<PostDocument> {
    const shortId = crypto.randomBytes(6).toString('hex');
    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    const fullSlug = `${baseSlug}-${shortId}`;

    const newPost = new this.postModel({
      ...dto,
      slug: fullSlug,
      content: { blocks: [] },
      authorId: new Types.ObjectId(userId),
      tenantId: new Types.ObjectId(tenantId),
      status: 'draft',
    });

    return newPost.save();
  }


async updateDraft(tenantId: string, postId: string, data: { content?: any; title?: string }) {
    let updatePayload: any = { ...data };

    if (data.content && data.content.content) { 
      const { words, minutes } = calculateReadingTime(data.content);
      updatePayload.wordCount = words;
      updatePayload.readingTime = minutes;
    }

    return this.postModel.findOneAndUpdate(
        { _id: postId, tenantId }, 
        updatePayload, 
        { new: true }
    );
}
}