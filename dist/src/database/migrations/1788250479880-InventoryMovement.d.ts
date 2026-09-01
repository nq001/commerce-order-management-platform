import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class InventoryMovement1788250479880 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
