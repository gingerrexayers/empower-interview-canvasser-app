import { ConflictException } from '@nestjs/common';

export class CanvasserEmailAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`Canvasser with email '${email}' already exists`);
  }
}
