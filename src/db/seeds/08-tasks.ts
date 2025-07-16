/* eslint-disable no-console */
import Knex from 'knex';
import fs from 'fs';
import path from 'path';
import TasksWorkflow from '../../workflows/tasks';
import UserService from '../../services/users';
import { CategoryModel } from '../model/CategoryModel';
import { RelayPointModel } from '../model/RelayPointModel';
import { TaskType, PackageCategory } from '../../types/graphql/typeDefs';

export async function seed(knex: Knex): Promise<void> {
  // Efface les anciennes données
  await knex('task_messages').del();
  await knex('task_applications').del();
  await knex('shippings').del();
  await knex('tasks').del();

  // Récupérer un user basic
  const user = await UserService.findByEmail('basic@example.com');
  if (!user) throw new Error('User basic@example.com not found');

  const someAddresses = [
    {
      full_address: '12 Avenue des Champs-Élysées, 75008 Paris, France',
      lat: 48.869796,
      lng: 2.307266,
      location_type: 'ROUTE',
      main_text: 'Avenue des Champs-Élysées',
      place_id: 'champs-elysees-12',
      secondary_text: '75008 Paris',
    },
    {
      full_address: '120 Rue de Courcelles, 75017 Paris, France',
      lat: 48.882324,
      lng: 2.301568,
      location_type: 'ROUTE',
      main_text: 'Rue de Courcelles',
      place_id: 'courcelles-120',
      secondary_text: '75017 Paris',
    },
    {
      full_address: '5 Rue de la Paix, 75002 Paris, France',
      lat: 48.868634,
      lng: 2.331951,
      location_type: 'ROUTE',
      main_text: 'Rue de la Paix',
      place_id: 'paix-5',
      secondary_text: '75002 Paris',
    },
    {
      full_address: '33 Avenue du Général Leclerc, 92100 Boulogne-Billancourt, France',
      lat: 48.833222,
      lng: 2.241624,
      location_type: 'ROUTE',
      main_text: 'Avenue du Général Leclerc',
      place_id: 'leclerc-33-boulogne',
      secondary_text: '92100 Boulogne-Billancourt',
    },
    {
      full_address: '18 Boulevard Saint-Germain, 75005 Paris, France',
      lat: 48.850964,
      lng: 2.350487,
      location_type: 'ROUTE',
      main_text: 'Boulevard Saint-Germain',
      place_id: 'stgermain-18',
      secondary_text: '75005 Paris',
    },
    {
      full_address: '77 Rue de Paris, 93200 Saint-Denis, France',
      lat: 48.936222,
      lng: 2.35741,
      location_type: 'ROUTE',
      main_text: 'Rue de Paris',
      place_id: 'paris-77-saintdenis',
      secondary_text: '93200 Saint-Denis',
    },
    {
      full_address: '22 Rue de Rivoli, 75004 Paris, France',
      lat: 48.855623,
      lng: 2.360146,
      location_type: 'ROUTE',
      main_text: 'Rue de Rivoli',
      place_id: 'rivoli-22',
      secondary_text: '75004 Paris',
    },
    {
      full_address: '15 Rue de la République, 92800 Puteaux, France',
      lat: 48.883013,
      lng: 2.2389,
      location_type: 'ROUTE',
      main_text: 'Rue de la République',
      place_id: 'republique-15-puteaux',
      secondary_text: '92800 Puteaux',
    },
    {
      full_address: '8 Rue de la Pompe, 75116 Paris, France',
      lat: 48.864222,
      lng: 2.277012,
      location_type: 'ROUTE',
      main_text: 'Rue de la Pompe',
      place_id: 'pompe-8',
      secondary_text: '75116 Paris',
    },
    {
      full_address: '3 Avenue Charles de Gaulle, 94100 Saint-Maur-des-Fossés, France',
      lat: 48.800003,
      lng: 2.493003,
      location_type: 'ROUTE',
      main_text: 'Avenue Charles de Gaulle',
      place_id: 'cdg-3-stmaur',
      secondary_text: '94100 Saint-Maur-des-Fossés',
    },
    {
      full_address: '45 Avenue Victor Hugo, 75116 Paris, France',
      lat: 48.872222,
      lng: 2.285555,
      location_type: 'ROUTE',
      main_text: 'Avenue Victor Hugo',
      place_id: 'hugo-45',
      secondary_text: '75116 Paris',
    },
    {
      full_address: '60 Rue de la Convention, 75015 Paris, France',
      lat: 48.841003,
      lng: 2.287003,
      location_type: 'ROUTE',
      main_text: 'Rue de la Convention',
      place_id: 'convention-60',
      secondary_text: '75015 Paris',
    },
    {
      full_address: '101 Rue de Sèvres, 75006 Paris, France',
      lat: 48.847222,
      lng: 2.32,
      location_type: 'ROUTE',
      main_text: 'Rue de Sèvres',
      place_id: 'sevres-101',
      secondary_text: '75006 Paris',
    },
    {
      full_address: '2 Place de la Bastille, 75011 Paris, France',
      lat: 48.853,
      lng: 2.369,
      location_type: 'ESTABLISHMENT',
      main_text: 'Place de la Bastille',
      place_id: 'bastille-2',
      secondary_text: '75011 Paris',
    },
  ];

  // Insère les adresses si elles n'existent pas déjà
  for (const addr of someAddresses) {
    const exists = await knex('addresses').where('full_address', addr.full_address).first();
    if (!exists) {
      await knex('addresses').insert({
        ...addr,
        geom: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [addr.lng, addr.lat]),
      });
    }
  }

  // Récupérer les catégories existantes et faire un mapping nom -> id
  const categories = await CategoryModel.query();
  const categoriesByName = Object.fromEntries(categories.map((c) => [c.name.toLowerCase(), c.id]));
  // Récupérer les points relais existants
  const relayPoints = await RelayPointModel.query().withGraphFetched('address');

  // Exemple : on prend les 3 premiers points relais pour les livraisons
  const shippingRelayPoints = relayPoints.slice(0, 3);

  // Préparer les images
  const assetsDir = path.resolve(__dirname, 'assets');
  const getUpload = (filename: string) => {
    const imagePath = path.join(assetsDir, filename);
    if (!fs.existsSync(imagePath)) throw new Error(`Image non trouvée: ${filename}`);
    const ext = path.extname(filename).toLowerCase();
    return {
      createReadStream: () => fs.createReadStream(imagePath),
      encoding: '7bit',
      filename,
      mimetype: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.replace('.', '')}`,
    };
  };

  // Tâches de type Service (on continue d'utiliser les adresses existantes)
  const addresses = await knex('addresses').select('*').limit(5);
  if (addresses.length < 3) throw new Error("Pas assez d'adresses pour les seeds tasks");

  // Création des tâches de type SHIPPING avec les adresses des points relais
  for (const [i, relayPoint] of shippingRelayPoints.entries()) {
    const pickup = addresses[i % addresses.length];
    await TasksWorkflow.createTask(
      {
        address: {
          fullAddress: pickup.full_address,
          lat: pickup.lat,
          lng: pickup.lng,
          locationType: pickup.location_type,
          mainText: pickup.main_text,
          placeId: pickup.place_id,
          secondaryText: pickup.secondary_text,
        },

        categoryId: categoriesByName.livraison,
        // destination = point relais
        description: `Livraison vers le point relais ${relayPoint.name}`,
        file: getUpload('delivery.jpeg'),
        packageCategory: PackageCategory.Small,
        pickupAddress: {
          fullAddress: pickup.full_address,
          lat: pickup.lat,
          lng: pickup.lng,
          locationType: pickup.location_type,
          mainText: pickup.main_text,
          placeId: pickup.place_id,
          secondaryText: pickup.secondary_text,
        },
        relayPointId: relayPoint.id,
        title: `Livraison vers ${relayPoint.name}`,
        type: TaskType.Shipping,
      },
      user.id,
      console
    );
  }
}
