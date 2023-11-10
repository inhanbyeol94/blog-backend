import { Injectable } from '@nestjs/common';
import { AuthHistoryRepository } from './auth-history.repository';
import { createAuthHistoryDto } from './auth-history.dto';

@Injectable()
export class AuthHistoryService {
  constructor(private authHistoryRepository: AuthHistoryRepository) {}

  async createAuthHistory(data: createAuthHistoryDto): Promise<void> {
    try {
      await this.authHistoryRepository.createAuthHistory(data);
    } catch (error) {
      console.error(error);
    }
  }
}
