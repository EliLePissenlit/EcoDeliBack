import mongoose from 'mongoose';
import { User } from '../models/User';
import { Colis } from '../models/Colis';
import bcrypt from 'bcryptjs';
import { ColisStatus } from '../types/enums';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecodeli';

const users = [
  {
    email: 'admin@ecodeli.fr',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'System',
    roles: ['admin']
  },
  {
    email: 'livreur@ecodeli.fr',
    password: 'livreur123',
    firstName: 'Jean',
    lastName: 'Delivery',
    roles: ['livreur']
  },
  {
    email: 'client@ecodeli.fr',
    password: 'client123',
    firstName: 'Marie',
    lastName: 'Cliente',
    roles: ['user']
  },
  {
    email: 'commercant@ecodeli.fr',
    password: 'commerce123',
    firstName: 'Pierre',
    lastName: 'Boutique',
    roles: ['commercant', 'user']
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    await User.deleteMany({});
    await Colis.deleteMany({});
    console.log('Base de données nettoyée');

    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword
        });
      })
    );
    console.log('Utilisateurs créés');

    const colis = [
      {
        expediteur: createdUsers[2]._id, 
        destinataire: createdUsers[3]._id, 
        livreur: createdUsers[1]._id,
        statut: ColisStatus.EN_COURS,
        poids: 2.5,
        dimensions: '30x20x15',
        valeur: 150,
        assurance: true,
        adresse_depart: '123 rue du Commerce, Paris',
        adresse_arrivee: '456 rue du Client, Lyon',
        date_envoi: new Date(),
        date_livraison_estimee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
        historique: [
          {
            statut: ColisStatus.EN_ATTENTE,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            commentaire: 'Colis créé'
          },
          {
            statut: ColisStatus.EN_COURS,
            date: new Date(),
            commentaire: 'Pris en charge par le livreur'
          }
        ]
      },
      {
        expediteur: createdUsers[3]._id, 
        destinataire: createdUsers[2]._id, 
        statut: ColisStatus.EN_ATTENTE,
        poids: 1.8,
        dimensions: '25x15x10',
        valeur: 75,
        assurance: false,
        adresse_depart: '789 rue du Magasin, Paris',
        adresse_arrivee: '321 rue de la Livraison, Marseille',
        date_envoi: new Date(),
        date_livraison_estimee: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
        historique: [
          {
            statut: ColisStatus.EN_ATTENTE,
            date: new Date(),
            commentaire: 'Colis créé'
          }
        ]
      }
    ];

    await Colis.insertMany(colis);
    console.log('Colis créés');

    console.log('Base de données initialisée avec succès !');
    console.log('Identifiants de test :');
    users.forEach(user => {
      console.log(`${user.roles.join(', ')} - ${user.email} / ${user.password}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

seedDatabase();