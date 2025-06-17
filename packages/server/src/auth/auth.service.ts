import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Canvasser } from 'src/canvassers/canvasser.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CanvasserEmailAlreadyExistsException } from './exceptions/canvasser-email-already-exists.exception';
import { MysqlErrorCode } from '../common/mysql-error-codes';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Canvasser)
    private canvassersRepository: Repository<Canvasser>,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const user = await this.canvassersRepository.findOneBy({ email });
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Invalid login!');
    }
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      console.log('Password not matching');
      throw new UnauthorizedException('Invalid login!');
    }
    const payload = { email, id: user.id };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async register(registerDto: RegisterDto): Promise<Canvasser> {
    const { name, email, password } = registerDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.canvassersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    try {
      await this.canvassersRepository.save(user);
      // Exclude password from the returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result as Canvasser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.driverError?.code === MysqlErrorCode.UniqueViolation) {
          throw new CanvasserEmailAlreadyExistsException(email);
        }
      }
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
