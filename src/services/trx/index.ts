import Model from '../../db';

class TrxService {
  public static async doInTransaction(callback) {
    return Model.transaction(async (trx) => {
      await trx.raw('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      return callback(trx);
    });
  }

  public static async doConcurrentTransaction(callback) {
    return Model.transaction(async (trx) => {
      await trx.raw('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
      return callback(trx);
    });
  }
}

export default TrxService;
