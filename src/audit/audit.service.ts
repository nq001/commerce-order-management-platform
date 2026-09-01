import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: any,
    ipAddress?: string,
  ): Promise<AuditLog> {
    this.logger.log(`AUDIT: User ${userId} performed ${action} on ${entityType} ${entityId}`);
    
    const log = this.auditLogRepo.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
    });

    return this.auditLogRepo.save(log);
  }
}
