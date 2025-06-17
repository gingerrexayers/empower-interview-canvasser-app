import { NotFoundException } from '@nestjs/common';

export class CanvasserNotFoundException extends NotFoundException {
  constructor(email: string) {
    super(`Canvasser with email '${email}' not found`);
  }
}
