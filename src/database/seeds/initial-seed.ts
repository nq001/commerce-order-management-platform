import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Inventory } from '../entities/inventory.entity';
import { RolePermission } from '../entities/role-permission.entity';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('Database connected, starting seed...');

  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const rolePermRepo = dataSource.getRepository(RolePermission);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const inventoryRepo = dataSource.getRepository(Inventory);

  // Clear existing simple data to avoid conflicts if re-running
  await dataSource.query(
    'TRUNCATE TABLE products, categories, role_permissions, permissions, roles, inventories CASCADE',
  );

  console.log('Cleared existing data.');

  // Create permissions
  const p1 = permRepo.create({ action: 'inventory.update' });
  const p2 = permRepo.create({ action: 'catalog.manage' });
  const p3 = permRepo.create({ action: 'orders.view' });
  await permRepo.save([p1, p2, p3]);

  // Create roles
  const adminRole = roleRepo.create({
    name: 'ADMIN',
    description: 'Full access',
  });
  const customerRole = roleRepo.create({
    name: 'CUSTOMER',
    description: 'Standard customer',
  });
  await roleRepo.save([adminRole, customerRole]);

  // Assign permissions to admin
  await rolePermRepo.save([
    rolePermRepo.create({ role: adminRole, permission: p1 }),
    rolePermRepo.create({ role: adminRole, permission: p2 }),
    rolePermRepo.create({ role: adminRole, permission: p3 }),
  ]);

  // Create categories
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

  // Create products
  const product1 = productRepo.create({
    sku: 'LAP-123',
    name: 'Pro Laptop 15"',
    description: 'High performance laptop for professionals.',
    price: 150000, // $1500.00
    category: laptops,
  });
  await productRepo.save(product1);

  // Create inventory
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
