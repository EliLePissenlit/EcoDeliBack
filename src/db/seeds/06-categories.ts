import Knex from 'knex';
import fs from 'fs';
import path from 'path';
import CategoryWorkflow from '../../workflows/categories';
import UserService from '../../services/users';

export async function seed(knex: Knex): Promise<void> {
  // Efface les anciennes catégories
  await knex('categories').del();

  // Récupérer un admin existant
  const admin = await UserService.findByEmail('admin@ecodeli.fr');

  // Mapping des catégories
  const categories = [
    {
      amountInCents: 2000,
      color: '#FFB6C1',
      description: 'Garde d’enfants à domicile tarif horaire',
      filename: 'baby-sitting.jpeg',
      name: 'Baby-sitting',
    },
    {
      amountInCents: 2500,
      color: '#4ECDC4',
      description: 'Entretien des espaces verts et jardins tarif horaire',
      filename: 'jardinage.jpeg',
      name: 'Jardinage',
    },
    {
      amountInCents: 3500,
      color: '#96CEB4',
      description: 'Petits travaux et réparations à domicile tarif horaire',
      filename: 'travaux.png',
      name: 'Bricolage',
    },
    {
      amountInCents: 1800,
      color: '#DDA0DD',
      description: 'Courses et livraisons à domicile tarif horaire',
      filename: 'shopping.jpeg',
      name: 'Courses',
    },
    {
      amountInCents: 2800,
      color: '#98D8C8',
      description: 'Préparation de repas à domicile tarif horaire',
      filename: 'cooking.jpeg',
      name: 'Cuisine',
    },
    {
      amountInCents: 5000,
      color: '#FFA07A',
      description: 'Services de coiffure et beauté à domicile tarif horaire',
      filename: 'haircut.jpg',
      name: 'Coiffure & Beauté',
    },
    {
      amountInCents: 4000,
      color: '#74B9FF',
      description: 'Soutien scolaire et cours à domicile tarif horaire',
      filename: 'learning.jpeg',
      name: 'Cours particuliers',
    },
    {
      amountInCents: 3200,
      color: '#F7DC6F',
      description: 'Assistance informatique et technique tarif horaire',
      filename: 'reparator.jpeg',
      name: 'Informatique',
    },
    {
      amountInCents: 3000,
      color: '#45B7D1',
      description: 'Livraison (tarification spécifique)',
      filename: 'shipping.png',
      name: 'Livraison',
    },
  ];

  const assetsDir = path.resolve(__dirname, 'assets');

  // Filtrer les catégories dont l'image existe réellement
  const filteredCategories = categories.filter((cat) => {
    const imagePath = path.join(assetsDir, cat.filename);
    if (!fs.existsSync(imagePath)) {
      // eslint-disable-next-line no-console
      console.warn(`Image non trouvée pour la catégorie ${cat.name} : ${cat.filename}`);
      return false;
    }
    return true;
  });

  for (const cat of filteredCategories) {
    const imagePath = path.join(assetsDir, cat.filename);
    const ext = path.extname(cat.filename).toLowerCase();
    const upload = {
      createReadStream: () => fs.createReadStream(imagePath),
      encoding: '7bit',
      filename: cat.filename,
      mimetype: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.replace('.', '')}`,
    };
    await CategoryWorkflow.createCategory(
      {
        amountInCents: cat.amountInCents,
        color: cat.color,
        description: cat.description,
        file: upload,
        name: cat.name,
      },
      admin
    );
  }
}
