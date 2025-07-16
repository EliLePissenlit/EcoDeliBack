import { Model, QueryBuilder, TransactionOrKnex } from 'objection';

import getSafeArray from '../../utils/getSafeArray';

class GenericService<T extends Model> {
  model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }

  public initializeQuery(trx?: TransactionOrKnex): QueryBuilder<T> {
    return this.model.query(trx) as QueryBuilder<T>;
  }

  public async save({ id, input }: { id?: string; input: Partial<T> }, trx?: TransactionOrKnex): Promise<any> {
    if (id) {
      const query = this.model.query(trx).patchAndFetchById(id, input) as unknown as QueryBuilder<T>;
      return trx ? await query.transacting(trx) : query;
    }
    const query = this.model.query(trx).insertAndFetch(input) as unknown as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async find(where: Partial<T>, trx?: TransactionOrKnex): Promise<T[]> {
    const query = this.model.query(trx).where(where) as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async findById(id: string, trx?: TransactionOrKnex): Promise<any> {
    const query = this.model.query(trx).findById(id) as unknown as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async findOne(where: Partial<T>, trx?: TransactionOrKnex): Promise<any> {
    const query = this.model.query(trx).findOne(where) as unknown as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async findAll(trx?: TransactionOrKnex): Promise<T[]> {
    const query = this.model.query(trx) as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async deleteById(id: string, trx?: TransactionOrKnex): Promise<any> {
    const query = this.model.query(trx).deleteById(id) as unknown as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async deleteAll(trx?: TransactionOrKnex): Promise<any> {
    const query = this.model.query(trx).delete() as unknown as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }

  public async getRelatedFor(relationName: string, forIds: Array<any>, trx?: TransactionOrKnex): Promise<any> {
    const safeIds = getSafeArray(forIds);
    const query = this.model.relatedQuery(relationName, trx).for(safeIds) as QueryBuilder<T>;
    return trx ? await query.transacting(trx) : query;
  }
}

export default GenericService;
