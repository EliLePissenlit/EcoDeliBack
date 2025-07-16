import Model from '..';

export class PricingConfigModel extends Model {
  id!: string;

  name!: string;

  isActive!: boolean;

  basePriceSmall!: number;

  basePriceMedium!: number;

  basePriceLarge!: number;

  pricePerKm!: number;

  pricePerMinute!: number;

  createdAt!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'pricing_configs';
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
