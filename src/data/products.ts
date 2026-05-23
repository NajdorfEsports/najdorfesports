export interface Product {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: 'USD' | 'EUR' | 'AUD' | 'JPY' | 'KRW';
  image?: string;
  available: boolean;
}

export const products: ReadonlyArray<Product> = [];
