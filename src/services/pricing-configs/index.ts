import { PricingConfigModel } from '../../db/model/PricingConfigModel';
import GenericService from '../@generic';
import logger from '../../infrastructure/logger';

class PricingConfigService extends GenericService<PricingConfigModel> {
  constructor() {
    super(PricingConfigModel);
  }

  /**
   * Obtient la configuration de prix actuellement active
   */
  public async getActiveConfig(): Promise<PricingConfigModel | null> {
    try {
      return await this.initializeQuery().where('is_active', true).first();
    } catch (error) {
      logger.error('Erreur lors de la récupération de la configuration active', { error });
      throw new Error('Impossible de récupérer la configuration active');
    }
  }

  /**
   * Obtient toutes les configurations
   */
  public async getAllConfigs(): Promise<PricingConfigModel[]> {
    try {
      return await this.initializeQuery().orderBy('created_at', 'desc');
    } catch (error) {
      logger.error('Erreur lors de la récupération de toutes les configurations', { error });
      throw new Error('Impossible de récupérer les configurations');
    }
  }

  /**
   * Crée une nouvelle configuration de prix et l'active
   */
  public async createActiveConfig(configData: Partial<PricingConfigModel>): Promise<PricingConfigModel> {
    try {
      // Désactiver toutes les autres configurations
      await this.initializeQuery().where('is_active', true).patch({
        isActive: false,
      });

      // Créer et activer la nouvelle configuration
      const newConfig = await this.save({
        input: {
          ...configData,
          isActive: true,
        },
      });

      return newConfig;
    } catch (error) {
      logger.error('Erreur lors de la création de la configuration active', { configData, error });
      throw new Error('Impossible de créer la configuration active');
    }
  }

  /**
   * Active une configuration existante
   */
  public async activateConfig(configId: string): Promise<boolean> {
    try {
      const config = await this.findById(configId);
      if (!config) {
        throw new Error('Configuration non trouvée');
      }

      // Désactiver toutes les autres configurations
      await this.initializeQuery().where('is_active', true).patch({
        isActive: false,
      });

      // Activer cette configuration
      await this.save({
        id: configId,
        input: {
          isActive: true,
        },
      });

      return true;
    } catch (error) {
      logger.error("Erreur lors de l'activation de la configuration", { configId, error });
      throw new Error("Impossible d'activer la configuration");
    }
  }

  /**
   * Désactive une configuration
   */
  public async deactivateConfig(configId: string): Promise<boolean> {
    try {
      const config = await this.findById(configId);
      if (!config) {
        throw new Error('Configuration non trouvée');
      }

      await this.save({
        id: configId,
        input: {
          isActive: false,
        },
      });

      return true;
    } catch (error) {
      logger.error('Erreur lors de la désactivation de la configuration', { configId, error });
      throw new Error('Impossible de désactiver la configuration');
    }
  }

  /**
   * Valide une configuration de prix
   */
  public validateConfig(config: Partial<PricingConfigModel>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.name || config.name.trim().length === 0) {
      errors.push('Le nom de la configuration est requis');
    }

    if (!config.basePriceSmall || config.basePriceSmall < 0) {
      errors.push('Le prix de base pour les petits colis doit être positif');
    }

    if (!config.basePriceMedium || config.basePriceMedium < 0) {
      errors.push('Le prix de base pour les colis moyens doit être positif');
    }

    if (!config.basePriceLarge || config.basePriceLarge < 0) {
      errors.push('Le prix de base pour les gros colis doit être positif');
    }

    if (!config.pricePerKm || config.pricePerKm < 0) {
      errors.push('Le prix par km doit être positif');
    }

    if (!config.pricePerMinute || config.pricePerMinute < 0) {
      errors.push('Le prix par minute doit être positif');
    }

    return {
      errors,
      isValid: errors.length === 0,
    };
  }
}

export default new PricingConfigService();
