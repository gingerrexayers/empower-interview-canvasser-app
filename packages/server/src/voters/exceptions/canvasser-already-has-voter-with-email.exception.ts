import { ConflictException } from '@nestjs/common';

export class CanvasserAlreadyHasVoterWithEmailException extends ConflictException {
  constructor(email: string) {
    super(`Canvasser already has a voter with email '${email}'`);
  }
}
