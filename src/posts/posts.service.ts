import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Post, IPost } from "../models/post.model";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { generateSlug as generateSlugUtil } from "../common/utils/slug.util";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<IPost>,
    private cloudinaryService: CloudinaryService,
  ) {}

  generateSlug(title: string): string {
    return generateSlugUtil(title);
  }

  async create(createPostDto: CreatePostDto, userId: string, tenantId: string): Promise<IPost> {
    let slug = createPostDto.slug;
    if (!slug) {
      slug = generateSlugUtil(createPostDto.title);
    }

    // Check if slug already exists
    const existingPost = await this.postModel.findOne({ slug });
    if (existingPost) {
      throw new ConflictException("Post with this slug already exists");
    }

    const post = new this.postModel({
      ...createPostDto,
      slug,
      userId: new Types.ObjectId(userId),
      tenantId,
    });

    return post.save();
  }

  async findAll(tenantId?: string, isPublic?: boolean): Promise<IPost[]> {
    const query: any = {};
    if (tenantId) {
      query.tenantId = tenantId;
    }
    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    } else if (!tenantId) {
      // If no tenantId and no isPublic specified, default to public posts
      query.isPublic = true;
    }
    return this.postModel.find(query).populate("userId", "name").sort({ createdAt: -1 });
  }

  async findOne(id: string, tenantId?: string): Promise<IPost> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    } else {
      query.isPublic = true;
    }
    const post = await this.postModel
      .findOne(query)
      .populate("userId", "name");
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  async findBySlug(slug: string, tenantId?: string): Promise<IPost> {
    const query: any = { slug };
    if (tenantId) {
      query.tenantId = tenantId;
    } else {
      // For public access, only return public posts
      query.isPublic = true;
    }
    const post = await this.postModel
      .findOne(query)
      .populate("userId", "name");
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string, tenantId: string): Promise<IPost> {
    const post = await this.postModel.findOne({ _id: id, tenantId, userId });
    if (!post) {
      throw new NotFoundException("Post not found or you don't have permission to update it");
    }

    // Check slug uniqueness if updating slug
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postModel.findOne({ slug: updatePostDto.slug });
      if (existingPost) {
        throw new ConflictException("Post with this slug already exists");
      }
    }

    Object.assign(post, updatePostDto);
    return post.save();
  }

  async remove(id: string, userId: string, tenantId: string): Promise<void> {
    const post = await this.postModel.findOne({ _id: id, tenantId, userId });
    if (!post) {
      throw new NotFoundException("Post not found or you don't have permission to delete it");
    }

    // Delete associated image if exists
    if (post.image) {
      await this.cloudinaryService.deleteImage(post.image);
    }

    await this.postModel.deleteOne({ _id: id });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.cloudinaryService.uploadImage(file);
  }
}
