import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Canvasser } from '../canvassers/canvasser.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CanvasserEmailAlreadyExistsException } from './exceptions/canvasser-email-already-exists.exception';
import { MysqlErrorCode } from '../common/mysql-error-codes';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(Canvasser)
    private canvassersRepository: Repository<Canvasser>,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const { email, password } = loginDto;
    const user = await this.canvassersRepository.findOneBy({ email });
    if (!user) {
      this.logger.warn(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid login!');
    }
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      this.logger.warn(
        `Login failed: Password mismatch for email: ${email} (ID: ${user.id})`,
      );
      throw new UnauthorizedException('Invalid login!');
    }
    const payload = { email, id: user.id, name: user.name };
    const token = this.jwtService.sign(payload);
    this.logger.log(`User ${email} (ID: ${user.id}) logged in successfully`);
    return { token };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<Omit<Canvasser, 'password'>> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    const { name, email, password } = registerDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.canvassersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.canvassersRepository.save(user);
      this.logger.log(
        `User ${savedUser.email} (ID: ${savedUser.id}) registered successfully`,
      );
      // Exclude password from the returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = savedUser;
      return result;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.driverError?.code === MysqlErrorCode.UniqueViolation) {
          this.logger.warn(
            `Registration failed: Email ${email} already exists.`,
          );
          throw new CanvasserEmailAlreadyExistsException(email);
        }
      }
      this.logger.error(
        `Registration failed for email: ${email} due to an internal error.`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new InternalServerErrorException();
    }
  }
}
