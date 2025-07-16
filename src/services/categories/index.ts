import { Transaction } from 'objection';
import GenericService from '../@generic';
import { CategoryModel } from '../../db/model/CategoryModel';
import FileService from '../files';
import logger from '../../infrastructure/logger';
import { User, CreateCategoryInput, UpdateCategoryInput, FileType } from '../../types/graphql/typeDefs';
import { streamToBuffer } from '../../utils/upload';

class CategoryService extends GenericService<CategoryModel> {
  constructor() {
    super(CategoryModel);
  }

  /**
   * Crée une catégorie avec gestion des fichiers
   */
  public async createCategory(data: CreateCategoryInput, user: User, trx?: Transaction): Promise<CategoryModel> {
    try {
      let fileId: string | undefined;

      // Créer le fichier si des données de fichier sont fournies
      if (data.file) {
        const { content, fileName } = await streamToBuffer(data.file);

        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.CategoryIcon,
          user,
        });
        fileId = file.id;
      }

      // Créer la catégorie
      const category = await this.save(
        {
          input: {
            amountInCents: data.amountInCents || 2000, // Valeur par défaut si non fournie
            color: data.color,
            description: data.description,
            fileId: fileId || undefined,
            name: data.name,
          },
        },
        trx
      );

      return category;
    } catch (error) {
      logger.error('[CATEGORY_SERVICE] Error creating category', { data, error });
      throw new Error('Impossible de créer la catégorie');
    }
  }

  /**
   * Met à jour une catégorie avec gestion des fichiers
   */
  public async updateCategory(
    id: string,
    data: UpdateCategoryInput,
    user: User,
    trx?: Transaction
  ): Promise<CategoryModel> {
    try {
      let fileId: string | undefined;

      // Récupérer la catégorie existante pour avoir l'ID du fichier actuel
      const existingCategory = await this.findById(id, trx);

      // Créer le fichier si des données de fichier sont fournies
      if (data.file) {
        const { content, fileName } = await streamToBuffer(data.file);

        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.CategoryIcon,
          user,
        });
        fileId = file.id;
      } else {
        fileId = existingCategory.fileId;
      }

      // Mettre à jour la catégorie
      const category = await this.save(
        {
          id,
          input: {
            amountInCents: data.amountInCents || undefined,
            color: data.color || undefined,
            description: data.description || undefined,
            fileId: fileId || undefined,
            name: data.name || undefined,
          },
        },
        trx
      );

      return category;
    } catch (error) {
      logger.error('[CATEGORY_SERVICE] Error updating category', { data, error, id });
      throw new Error('Impossible de mettre à jour la catégorie');
    }
  }
}

export default new CategoryService();
