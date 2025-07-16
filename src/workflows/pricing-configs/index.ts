import PricingConfigService from '../../services/pricing-configs';
import { CreatePricingConfigInput } from '../../types/graphql/typeDefs';

class PricingConfigWorkflow {
  /**
   * Obtient la configuration de prix actuellement active
   */
  public static async getActiveConfig(): Promise<any | null> {
    return PricingConfigService.getActiveConfig();
  }

  /**
   * Obtient toutes les configurations de prix
   */
  public static async getAllConfigs(): Promise<any[]> {
    return PricingConfigService.getAllConfigs();
  }

  /**
   * Crée une nouvelle configuration de prix et l'active
   */
  public static async createActiveConfig(input: CreatePricingConfigInput): Promise<any> {
    // Valider la configuration
    const validation = PricingConfigService.validateConfig(input);
    if (!validation.isValid) {
      throw new Error(`Configuration invalide: ${validation.errors.join(', ')}`);
    }

    return PricingConfigService.createActiveConfig(input);
  }

  /**
   * Active une configuration existante
   */
  public static async activateConfig(configId: string): Promise<boolean> {
    // Vérifier que la configuration existe
    const config = await PricingConfigService.findById(configId);
    if (!config) {
      throw new Error('Configuration non trouvée');
    }

    return PricingConfigService.activateConfig(configId);
  }

  /**
   * Désactive une configuration
   */
  public static async deactivateConfig(configId: string): Promise<boolean> {
    // Vérifier que la configuration existe
    const config = await PricingConfigService.findById(configId);
    if (!config) {
      throw new Error('Configuration non trouvée');
    }

    return PricingConfigService.deactivateConfig(configId);
  }
}

export default PricingConfigWorkflow;
