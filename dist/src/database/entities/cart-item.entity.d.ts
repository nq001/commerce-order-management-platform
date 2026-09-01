import { Cart } from './cart.entity';
import { Product } from './product.entity';
export declare class CartItem {
    cart_id: string;
    product_id: string;
    quantity: number;
    cart: Cart;
    product: Product;
}
