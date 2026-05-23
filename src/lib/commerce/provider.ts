import type { Product } from '../../data/products';

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface LineItem {
  productId: string;
  quantity: number;
}

export interface CommerceProvider {
  name: string;
  listProducts(): Promise<ReadonlyArray<Product>>;
  getProduct(id: string): Promise<Product | null>;
  createCheckoutSession(items: LineItem[]): Promise<CheckoutSession>;
}

export class NoopProvider implements CommerceProvider {
  name = 'noop';
  async listProducts() {
    return [];
  }
  async getProduct(_id: string) {
    return null;
  }
  async createCheckoutSession(_items: LineItem[]): Promise<CheckoutSession> {
    throw new Error('Commerce provider not configured. See src/lib/commerce/provider.ts.');
  }
}

export const commerce: CommerceProvider = new NoopProvider();
