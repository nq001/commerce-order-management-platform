"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const data_source_1 = require("../data-source");
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../entities/permission.entity");
const category_entity_1 = require("../entities/category.entity");
const product_entity_1 = require("../entities/product.entity");
const inventory_entity_1 = require("../entities/inventory.entity");
const role_permission_entity_1 = require("../entities/role-permission.entity");
async function seed() {
    const dataSource = new typeorm_1.DataSource(data_source_1.dataSourceOptions);
    await dataSource.initialize();
    console.log('Database connected, starting seed...');
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    const permRepo = dataSource.getRepository(permission_entity_1.Permission);
    const rolePermRepo = dataSource.getRepository(role_permission_entity_1.RolePermission);
    const categoryRepo = dataSource.getRepository(category_entity_1.Category);
    const productRepo = dataSource.getRepository(product_entity_1.Product);
    const inventoryRepo = dataSource.getRepository(inventory_entity_1.Inventory);
    await dataSource.query('TRUNCATE TABLE products, categories, role_permissions, permissions, roles, inventories CASCADE');
    console.log('Cleared existing data.');
    const p1 = permRepo.create({ action: 'inventory.update' });
    const p2 = permRepo.create({ action: 'catalog.manage' });
    const p3 = permRepo.create({ action: 'orders.view' });
    await permRepo.save([p1, p2, p3]);
    const adminRole = roleRepo.create({
        name: 'ADMIN',
        description: 'Full access',
    });
    const customerRole = roleRepo.create({
        name: 'CUSTOMER',
        description: 'Standard customer',
    });
    await roleRepo.save([adminRole, customerRole]);
    await rolePermRepo.save([
        rolePermRepo.create({ role: adminRole, permission: p1 }),
        rolePermRepo.create({ role: adminRole, permission: p2 }),
        rolePermRepo.create({ role: adminRole, permission: p3 }),
    ]);
    const electronics = categoryRepo.create({
        name: 'Electronics',
        slug: 'electronics',
    });
    await categoryRepo.save(electronics);
    const laptops = categoryRepo.create({
        name: 'Laptops',
        slug: 'laptops',
        parent: electronics,
    });
    await categoryRepo.save(laptops);
    const product1 = productRepo.create({
        sku: 'LAP-123',
        name: 'Pro Laptop 15"',
        description: 'High performance laptop for professionals.',
        price: 150000,
        category: laptops,
    });
    await productRepo.save(product1);
    const inventory1 = inventoryRepo.create({
        product: product1,
        available_quantity: 50,
    });
    await inventoryRepo.save(inventory1);
    console.log('Seed completed successfully!');
    await dataSource.destroy();
}
seed().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=initial-seed.js.map