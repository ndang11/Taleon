import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { User, UserDocument } from '../schemas/users.schema';
import { Tenant, TenantDocument } from '../schemas/tenants.schema';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from 'src/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectConnection() private readonly connection: Connection,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name, blogName } = dto;

    // 1. Pre-flight checks
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('Email already registered');

    const slug = slugify(blogName, { lower: true, strict: true });
    const existingTenant = await this.tenantModel.findOne({ slug });
    if (existingTenant) throw new ConflictException('Blog name/slug already taken');

    // 2. Start the Session for Transaction
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 3. Create Tenant
      const createdTenants = await this.tenantModel.create(
        [{ name: blogName, slug }],
        { session }
      );
      const newTenant = createdTenants[0];
      if (!newTenant) throw new InternalServerErrorException('Failed to create tenant');

      // 4. Create User
      const hashedPassword = await bcrypt.hash(password, 12);
      const createdUsers = await this.userModel.create(
        [{
          name,
          email,
          password: hashedPassword,
          tenantId: newTenant._id
        }],
        { session }
      );
      const newUser = createdUsers[0];
      if (!newUser) throw new InternalServerErrorException('Failed to create user');

      newTenant.ownerId = newUser._id;
      await newTenant.save({ session });

      await session.commitTransaction();

      return this.generateToken(newUser);
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private generateToken(user: UserDocument) {
    const payload = { 
      sub: user._id.toString(), 
      email: user.email, 
      tenantId: user.tenantId.toString() 
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId
      }
    };
  }


async login(credentials: LoginDto) {
  const { email, password } = credentials;

  const user = await this.userModel
    .findOne({ email })
    .select('+password') 
    .exec();

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return this.generateToken(user);
}
}