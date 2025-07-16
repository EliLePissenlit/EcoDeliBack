import { Category, CreateCategoryInput, UpdateCategoryInput, User } from '../../types/graphql/typeDefs';

import CategoryService from '../../services/categories';

class CategoryWorkflow {
  public static async getCategories(): Promise<Category[]> {
    return CategoryService.initializeQuery().orderBy('createdAt', 'desc') as Promise<Category[]>;
  }

  public static async getCategory(id: string): Promise<Category> {
    return CategoryService.findById(id);
  }

  public static async createCategory(input: CreateCategoryInput, user: User): Promise<Category> {
    return CategoryService.createCategory(input, user);
  }

  public static async updateCategory(id: string, input: UpdateCategoryInput, user: User): Promise<Category> {
    return CategoryService.updateCategory(id, input, user);
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    return CategoryService.deleteById(id);
  }
}

export default CategoryWorkflow;
