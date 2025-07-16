import Knex from 'knex';
import fs from 'fs';
import path from 'path';
import RelayPointsWorkflow from '../../workflows/relay-points';
import UserService from '../../services/users';
import { LocationType } from '../../types/graphql/typeDefs';

export async function seed(knex: Knex): Promise<void> {
  // Efface les anciens points relais
  await knex('relay_points').del();

  // Récupère l'utilisateur partner
  const partnerUser = await UserService.findByEmail('partner@example.com');
  if (!partnerUser) throw new Error('Utilisateur partner non trouvé.');

  // Préparer l’upload de l’image
  const assetsDir = path.resolve(__dirname, 'assets');
  const filename = 'relay-point.jpeg';
  const imagePath = path.join(assetsDir, filename);
  if (!fs.existsSync(imagePath)) throw new Error(`Image non trouvée: ${filename}`);
  const ext = path.extname(filename).toLowerCase();
  const upload = {
    createReadStream: () => fs.createReadStream(imagePath),
    encoding: '7bit',
    filename,
    mimetype: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : `image/${ext.replace('.', '')}`,
  };

  // Exemple d'adresse complète (repris des seeds tasks)
  const address = {
    fullAddress: '12 Avenue des Champs-Élysées, 75008 Paris, France',
    lat: 48.869796,
    lng: 2.307266,
    locationType: LocationType.GpsLocation,
    mainText: 'Avenue des Champs-Élysées',
    placeId: 'champs-elysees-12',
    secondaryText: '75008 Paris',
  };

  // Appel du workflow pour créer le point relais avec tous les champs nécessaires
  await RelayPointsWorkflow.createRelayPoint(
    {
      address,
      description: 'Point relais avec une photo illustrative',
      file: upload,
      name: 'Point Relais avec Photo',
      openingDays: [
        { close: '18:00', day: 'monday', isOpen: true, open: '09:00' },
        { close: '18:00', day: 'tuesday', isOpen: true, open: '09:00' },
        { close: '18:00', day: 'wednesday', isOpen: true, open: '09:00' },
        { close: '18:00', day: 'thursday', isOpen: true, open: '09:00' },
        { close: '18:00', day: 'friday', isOpen: true, open: '09:00' },
        { close: '12:00', day: 'saturday', isOpen: true, open: '09:00' },
        { close: '00:00', day: 'sunday', isOpen: false, open: '00:00' },
      ], // Champ complet et typé
    },
    partnerUser
  );
}
