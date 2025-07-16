/* eslint-disable no-console */
/**
 * Service de gestion des tâches (annonces de services et livraisons)
 *
 * Ce service gère :
 * - Création et modification des tâches
 * - Calcul automatique des prix
 * - Gestion des statuts
 * - Filtrage et recherche
 *
 * Architecture : Hérite de GenericService pour les opérations CRUD de base
 */
import { TaskStatus, TaskType, PackageCategory, AddressInput, ApplicationStatus } from '../../types/graphql/typeDefs';
import GenericService from '../@generic';
import { TaskModel } from '../../db/model/TaskModel';
import { TaskApplicationModel } from '../../db/model/TaskApplicationModel';
import { TaskMessageModel } from '../../db/model/TaskMessageModel';
import { ShippingModel } from '../../db/model/ShippingModel';
import { CategoryModel } from '../../db/model/CategoryModel';
import { PricingConfigModel } from '../../db/model/PricingConfigModel';
import { AddressModel } from '../../db/model/AddressModel';
import AddressService from '../addresses';

class TasksService extends GenericService<TaskModel> {
  constructor() {
    super(TaskModel);
  }

  /**
   * Crée une nouvelle tâche avec gestion automatique des types
   *
   * @param taskData - Données de la tâche à créer
   * @param shippingData - Données spécifiques aux livraisons (optionnel)
   * @returns La tâche créée avec son ID
   */
  public async createTask(taskData: any, shippingData?: any): Promise<TaskModel> {
    const {
      type,
      // Champs spécifiques aux services (à ne pas insérer dans tasks)
      categoryId,
      estimatedDuration,
      // Champs communs (à insérer dans tasks)
      title,
      description,
      file,
      fileId,
      address,
      userId,
      ...otherData
    } = taskData;

    // Préparer les données pour la table tasks
    const taskInput: any = {
      addressId: address?.id || address,
      description,
      status: TaskStatus.Draft,
      title,
      type,
      userId,
      ...otherData,
    };

    // Ajouter les champs spécifiques selon le type
    if (type === TaskType.Service) {
      taskInput.estimatedDuration = estimatedDuration;
    }

    // Catégorie pour tous les types de tâches
    if (categoryId) {
      taskInput.categoryId = categoryId;
    }

    // Gérer l'upload de fichier si présent
    if (fileId) {
      taskInput.fileId = fileId;
    }

    // Créer la tâche principale
    const task = await this.save({
      input: taskInput,
    });

    // Si c'est une livraison, créer l'entité Shipping associée
    if (type === TaskType.Shipping && shippingData) {
      await this.createShippingForTask(task.id, shippingData);
    }

    // Calculer et stocker le prix selon le type de tâche
    const calculatedPrice = await this.calculateTaskPrice(task.id);
    await this.save({
      id: task.id,
      input: { calculatedPriceInCents: calculatedPrice },
    });

    return task;
  }

  /**
   * Met à jour le statut d'une tâche
   *
   * @param taskId - ID de la tâche
   * @param status - Nouveau statut
   * @returns La tâche mise à jour
   */
  public async updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskModel> {
    return await this.save({
      id: taskId,
      input: { status },
    });
  }

  /**
   * Récupère une tâche avec toutes ses relations
   *
   * @param taskId - ID de la tâche
   * @returns La tâche avec ses relations ou null
   */
  public async getTaskWithDetails(taskId: string): Promise<TaskModel | null> {
    return await TaskModel.query()
      .findById(taskId)
      .withGraphFetched('[category, address, shipping, applications, messages, user]');
  }

  /**
   * Liste les tâches avec filtres optionnels
   *
   * @param filters - Filtres à appliquer
   * @returns Liste des tâches filtrées
   */
  public async listTasksWithFilters(filters: any): Promise<TaskModel[]> {
    const query = TaskModel.query()
      .withGraphFetched('[category, address, shipping, user]')
      .orderBy('created_at', 'desc');

    // Appliquer les filtres fournis
    this.applyFilters(query, filters);

    return await query;
  }

  /**
   * Liste les tâches par statut
   *
   * @param status - Statut à filtrer
   * @returns Liste des tâches avec ce statut
   */
  public async listTasksByStatus(status: TaskStatus): Promise<TaskModel[]> {
    return await TaskModel.query()
      .where('status', status)
      .withGraphFetched('[category, address, shipping, user]')
      .orderBy('created_at', 'desc');
  }

  /**
   * Récupère les tâches d'un utilisateur spécifique
   *
   * @param userId - ID de l'utilisateur
   * @returns Liste des tâches de l'utilisateur
   */
  public async getMyTasks(userId: string): Promise<TaskModel[]> {
    return await TaskModel.query()
      .where('user_id', userId)
      .withGraphFetched('[category, address, shipping]')
      .orderBy('created_at', 'desc');
  }

  /**
   * Supprime une tâche et toutes ses dépendances
   *
   * @param taskId - ID de la tâche à supprimer
   */
  public async deleteTaskWithDependencies(taskId: string): Promise<void> {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await TaskApplicationModel.query().where('task_id', taskId).delete();
    await TaskMessageModel.query().where('task_id', taskId).delete();
    await ShippingModel.query().where('task_id', taskId).delete();

    // Supprimer la tâche principale
    await this.deleteById(taskId);
  }

  /**
   * Calcule le prix d'une tâche selon son type
   *
   * @param taskId - ID de la tâche
   * @returns Prix calculé en centimes
   */
  public async calculateTaskPrice(taskId: string): Promise<number> {
    const task = await this.findById(taskId);

    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    if (task.type === TaskType.Service) {
      return await this.calculateServicePrice(taskId);
    }
    if (task.type === TaskType.Shipping) {
      // Pour les tâches de shipping, on a besoin des données de shipping
      const shipping = await ShippingModel.query().where('task_id', taskId).first();

      if (!shipping) {
        throw new Error('Données de shipping non trouvées pour cette tâche');
      }

      // Utiliser le service de pricing pour un calcul cohérent
      const PricingService = (await import('../pricing')).default;

      // Récupérer les adresses avec leurs coordonnées
      const [pickupAddress, deliveryAddress] = await Promise.all([
        AddressModel.query().findById(shipping.pickupAddressId),
        AddressModel.query().findById(shipping.deliveryAddressId),
      ]);

      if (!pickupAddress || !deliveryAddress) {
        throw new Error("Adresses de départ ou d'arrivée non trouvées");
      }

      const pricingRange = await PricingService.calculatePriceRangeFromGeoData(
        { lat: pickupAddress.lat, lon: pickupAddress.lng },
        shipping.deliveryAddressId,
        shipping.packageCategory
      );

      return pricingRange.minPriceInCents;
    }

    throw new Error('Type de tâche non supporté pour le calcul de prix');
  }

  /**
   * Calcule le prix d'un service basé sur la catégorie et la durée
   *
   * @param taskId - ID de la tâche
   * @returns Prix calculé en centimes
   */
  public async calculateServicePrice(taskId: string): Promise<number> {
    const task = await this.findById(taskId);

    // Validation des données requises
    if (!this.canCalculateServicePrice(task)) {
      throw new Error('Impossible de calculer le prix pour cette tâche');
    }

    const category = await CategoryModel.query().findById(task.categoryId);
    if (!category?.amountInCents) {
      throw new Error('Catégorie non trouvée ou tarif horaire non défini');
    }

    // Calcul : tarif horaire × durée en heures
    const durationInHours = task.estimatedDuration / 60;
    return Math.round(category.amountInCents * durationInHours * 100);
  }

  /**
   * Calcule le prix d'une livraison basé sur la configuration active
   *
   * @param pickupAddressId - ID de l'adresse de départ
   * @param deliveryAddressId - ID de l'adresse de destination
   * @param packageCategory - Catégorie du colis
   * @returns Prix calculé en centimes
   */
  public async calculateShippingPrice(
    pickupAddressId: string,
    deliveryAddressId: string,
    packageCategory: PackageCategory
  ): Promise<number> {
    const activeConfig = await this.getActivePricingConfig();

    // Calculer la distance et la durée avec PostGIS
    const result = (await AddressModel.query()
      .select(
        AddressModel.raw(`
          ST_Distance(
            pickup.geom::geography,
            delivery.geom::geography
          ) as distance_in_meters
        `)
      )
      .from('addresses as pickup')
      .join('addresses as delivery', AddressModel.raw('1=1'))
      .where('pickup.id', pickupAddressId)
      .where('delivery.id', deliveryAddressId)
      .first()) as any;

    if (!result) {
      throw new Error("Adresses de départ ou d'arrivée non trouvées");
    }

    const distanceInMeters = Math.round(result.distance_in_meters || 0);

    // Validation pour éviter les valeurs NaN
    if (Number.isNaN(distanceInMeters) || distanceInMeters < 0) {
      console.error('Distance calculée invalide:', result.distance_in_meters);
      throw new Error('Impossible de calculer la distance entre les adresses');
    }

    // Calculer la durée estimée (logique simplifiée)
    const durationInMinutes = this.calculateEstimatedDuration(distanceInMeters);

    // Prix de base selon la catégorie de colis
    const basePrice = this.getBasePriceForCategory(activeConfig, packageCategory);

    // Calcul du prix total
    const distancePrice = (distanceInMeters / 1000) * activeConfig.pricePerKm; // distance en km
    const durationPrice = (durationInMinutes / 60) * activeConfig.pricePerMinute; // duration en minutes

    const totalPrice = basePrice + distancePrice + durationPrice;

    // Validation finale
    if (Number.isNaN(totalPrice) || totalPrice < 0) {
      console.error('Prix total calculé invalide:', {
        activeConfig,
        basePrice,
        distanceInMeters,
        distancePrice,
        durationInMinutes,
        durationPrice,
      });
      throw new Error('Erreur dans le calcul du prix de livraison');
    }

    return Math.round(totalPrice * 100);
  }

  /**
   * Calcule la durée estimée en minutes basée sur la distance
   */
  private calculateEstimatedDuration(distanceInMeters: number): number {
    const distanceInKm = distanceInMeters / 1000;

    // Vitesse moyenne urbaine : 30 km/h
    // Vitesse moyenne sur route : 60 km/h
    // Vitesse moyenne autoroute : 90 km/h

    let averageSpeedKmh = 30; // vitesse par défaut urbaine

    if (distanceInKm > 50) {
      averageSpeedKmh = 90; // autoroute pour les longues distances
    } else if (distanceInKm > 10) {
      averageSpeedKmh = 60; // route pour les distances moyennes
    }

    // Ajouter 20% de temps pour les arrêts, feux, etc.
    const durationInHours = (distanceInKm / averageSpeedKmh) * 1.2;

    return Math.round(durationInHours * 60);
  }

  // =============================================================================
  // MÉTHODES PRIVÉES - Logique métier interne
  // =============================================================================

  /**
   * Crée l'entité Shipping pour une tâche de livraison
   */
  private async createShippingForTask(taskId: string, shippingData: any): Promise<void> {
    const { packageCategory, pickupAddressId, deliveryAddressId, packageDetails } = shippingData;

    // Récupérer les adresses avec leurs coordonnées
    const [pickupAddress, deliveryAddress] = await Promise.all([
      AddressModel.query().findById(pickupAddressId),
      AddressModel.query().findById(deliveryAddressId),
    ]);

    if (!pickupAddress || !deliveryAddress) {
      throw new Error("Adresses de départ ou d'arrivée non trouvées");
    }

    // Utiliser le service de pricing pour calculer le prix, la distance et la durée
    const PricingService = (await import('../pricing')).default;
    const pricingRange = await PricingService.calculatePriceRangeFromGeoData(
      { lat: pickupAddress.lat, lon: pickupAddress.lng },
      deliveryAddressId,
      packageCategory
    );

    await ShippingModel.query().insert({
      calculatedPriceInCents: pricingRange.minPriceInCents,
      deliveryAddressId,
      estimatedDistanceInMeters: pricingRange.estimatedDistanceInMeters,
      estimatedDurationInMinutes: pricingRange.estimatedDurationInMinutes,
      packageCategory,
      packageDetails,
      pickupAddressId,
      taskId,
    });
  }

  /**
   * Applique les filtres à une requête
   */
  private applyFilters(query: any, filters: any): void {
    if (filters.type) {
      query.where('type', filters.type);
    }
    if (filters.status) {
      query.where('status', filters.status);
    }
    if (filters.categoryId) {
      query.where('category_id', filters.categoryId);
    }
    if (filters.durationMin) {
      query.where('estimated_duration', '>=', filters.durationMin);
    }
    if (filters.durationMax) {
      query.where('estimated_duration', '<=', filters.durationMax);
    }

    // Filtre géographique avec PostGIS
    if (filters.location && filters.radius) {
      this.applyGeographicFilter(query, filters.location, filters.radius);
    }
  }

  /**
   * Applique un filtre géographique avec PostGIS
   */
  private applyGeographicFilter(query: any, location: any, radiusKm: number): void {
    if (!location.latitude || !location.longitude) {
      return;
    }

    // Convertir le rayon en mètres
    const radiusMeters = radiusKm * 1000;

    // Requête PostGIS pour trouver les tâches dans le rayon
    query.join('addresses', 'tasks.address_id', 'addresses.id').whereRaw(
      `
        ST_DWithin(
          addresses.geom::geography,
          ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
          ?
        )
      `,
      [location.longitude, location.latitude, radiusMeters]
    );
  }

  /**
   * Vérifie si on peut calculer le prix d'un service
   */
  private canCalculateServicePrice(task: any): boolean {
    return task && task.type === TaskType.Service && task.categoryId && task.estimatedDuration;
  }

  /**
   * Récupère la configuration de tarification active
   */
  private async getActivePricingConfig(): Promise<any> {
    const activeConfig = await PricingConfigModel.query().where('is_active', true).first();

    if (!activeConfig) {
      throw new Error('Aucune configuration de tarification active trouvée');
    }

    return activeConfig;
  }

  /**
   * Récupère le prix de base selon la catégorie de colis
   */
  private getBasePriceForCategory(config: any, packageCategory: PackageCategory): number {
    switch (packageCategory) {
      case PackageCategory.Small:
        return config.basePriceSmall;
      case PackageCategory.Medium:
        return config.basePriceMedium;
      case PackageCategory.Large:
        return config.basePriceLarge;
      default:
        throw new Error('Catégorie de colis invalide');
    }
  }

  public async markAnIntermediaryStepForATask(
    taskId: string,
    intermediaryStep: AddressInput,
    userId: string
  ): Promise<any> {
    // Récupérer la tâche
    const task = await this.findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }
    // Vérifier que la tâche est de type Shipping
    if (task.type !== TaskType.Shipping) {
      throw new Error("Cette opération n'est possible que pour les tâches de type livraison");
    }
    // Créer la nouvelle adresse intermédiaire (pickup)
    const newPickupAddress = await AddressService.save({ input: intermediaryStep });
    // Récupérer l'entrée Shipping existante pour la tâche
    const existingShipping = await ShippingModel.query().where('task_id', taskId).first();
    if (!existingShipping) {
      throw new Error('Aucune entrée Shipping existante pour cette tâche');
    }
    // Destructuring pour plus de clarté
    const { packageCategory, deliveryAddressId, packageDetails } = existingShipping;
    // Utiliser le service de pricing pour calculer le prix, la distance et la durée
    const PricingService = (await import('../pricing')).default;
    const pricingRange = await PricingService.calculatePriceRangeFromGeoData(
      { lat: newPickupAddress.lat, lon: newPickupAddress.lng },
      deliveryAddressId,
      packageCategory
    );
    // Créer la nouvelle entrée Shipping
    await ShippingModel.query().insert({
      calculatedPriceInCents: pricingRange.minPriceInCents,
      deliveryAddressId,
      estimatedDistanceInMeters: pricingRange.estimatedDistanceInMeters,
      estimatedDurationInMinutes: pricingRange.estimatedDurationInMinutes,
      packageCategory,
      packageDetails,
      pickupAddressId: newPickupAddress.id,
      taskId,
    });

    // mettre a jour la task application pour la finir
    await TaskApplicationModel.query().where('task_id', taskId).update({
      applicantId: userId,
      status: ApplicationStatus.Completed,
    });

    // Mettre à jour la tâche pour pointer sur la nouvelle adresse de départ
    await this.save({
      id: taskId,
      input: { addressId: newPickupAddress.id, status: TaskStatus.Published },
    });
    // Retourner la tâche mise à jour avec ses relations
    return await this.getTaskWithDetails(taskId);
  }
}
// Export d'une instance singleton
export default new TasksService();
