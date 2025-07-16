import { Transaction } from 'objection';
import GenericService from '../@generic';
import { RelayPointModel } from '../../db/model/RelayPointModel';
import AddressService from '../addresses';
import FileService from '../files';
import logger from '../../infrastructure/logger';
import { User, CreateRelayPointInput, UpdateRelayPointInput, FileType } from '../../types/graphql/typeDefs';
import { streamToBuffer } from '../../utils/upload';

class RelayPointService extends GenericService<RelayPointModel> {
  constructor() {
    super(RelayPointModel);
  }

  /**
   * Crée un point relais avec gestion des adresses et fichiers
   */
  public async createRelayPoint(data: CreateRelayPointInput, user: User, trx?: Transaction): Promise<RelayPointModel> {
    try {
      let addressId: string | undefined;
      let fileId: string | undefined;

      // Créer l'adresse si des données d'adresse sont fournies
      if (data.address) {
        const address = await AddressService.save(
          {
            input: data.address,
          },
          trx
        );
        addressId = address.id;
      }

      // Créer le fichier si des données de fichier sont fournies
      if (data.file) {
        const { content, fileName } = await streamToBuffer(data.file);

        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.RelayPointImage,
          user,
        });
        fileId = file.id;
      }

      // Nettoyer les données openingDays en supprimant __typename
      const cleanOpeningDays = data.openingDays?.map((day: any) => {
        const { __typename, ...cleanDay } = day;
        return cleanDay;
      });

      // Créer le point relais
      const relayPoint = await this.save(
        {
          input: {
            addressId: addressId || undefined,
            description: data.description,
            fileId: fileId || undefined,
            name: data.name,
            openingDays: cleanOpeningDays,
            userId: user.id,
          },
        },
        trx
      );

      return relayPoint;
    } catch (error) {
      logger.error('[RELAY_POINT_SERVICE] Error creating relay point', { data, error });
      throw new Error('Impossible de créer le point relais');
    }
  }

  /**
   * Met à jour un point relais avec gestion des adresses et fichiers
   */
  public async updateRelayPoint(
    id: string,
    data: UpdateRelayPointInput,
    user: User,
    trx?: Transaction
  ): Promise<RelayPointModel> {
    try {
      let addressId: string | undefined;
      let fileId: string | undefined;

      // Récupérer le point relais existant pour avoir les IDs actuels
      const existingRelayPoint = await this.findById(id, trx);

      // Créer ou mettre à jour l'adresse si des données d'adresse sont fournies
      if (data.address) {
        if (existingRelayPoint.addressId) {
          // Mettre à jour l'adresse existante
          await AddressService.save(
            {
              id: existingRelayPoint.addressId,
              input: data.address,
            },
            trx
          );
          addressId = existingRelayPoint.addressId;
        } else {
          // Créer une nouvelle adresse
          const address = await AddressService.save(
            {
              input: data.address,
            },
            trx
          );
          addressId = address.id;
        }
      } else {
        addressId = existingRelayPoint.addressId;
      }

      // Créer le fichier si des données de fichier sont fournies
      if (data.file) {
        const { content, fileName } = await streamToBuffer(data.file);

        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.RelayPointImage,
          user,
        });
        fileId = file.id;
      } else {
        fileId = existingRelayPoint.fileId;
      }

      // Nettoyer les données openingDays en supprimant __typename
      const cleanOpeningDays = data.openingDays?.map((day: any) => {
        const { __typename, ...cleanDay } = day;
        return cleanDay;
      });

      // Mettre à jour le point relais
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (addressId !== undefined) updateData.addressId = addressId;
      if (fileId !== undefined) updateData.fileId = fileId;
      if (cleanOpeningDays !== undefined) updateData.openingDays = cleanOpeningDays;

      const relayPoint = await this.save(
        {
          id,
          input: updateData,
        },
        trx
      );

      return relayPoint;
    } catch (error) {
      logger.error('[RELAY_POINT_SERVICE] Error updating relay point', { data, error, id });
      throw new Error('Impossible de mettre à jour le point relais');
    }
  }
}

export default new RelayPointService();
