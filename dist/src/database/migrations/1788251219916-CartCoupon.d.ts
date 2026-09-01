import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CartCoupon1788251219916 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
