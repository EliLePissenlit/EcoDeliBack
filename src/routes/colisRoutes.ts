import express from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createColis, getColis, getColisById, updateColisStatus } from '../controllers/colisController';
import * as yup from 'yup';

const router = express.Router();

const createColisSchema = yup.object({
  destinataire: yup.string().required('ID du destinataire requis'),
  poids: yup.number().required('Poids requis').positive('Le poids doit être positif'),
  dimensions: yup.string(),
  valeur: yup.number().positive('La valeur doit être positive'),
  assurance: yup.boolean(),
  adresse_depart: yup.string().required('Adresse de départ requise'),
  adresse_arrivee: yup.string().required('Adresse d\'arrivée requise'),
  date_livraison_estimee: yup.date(),
});

const updateStatusSchema = yup.object({
  statut: yup.string().required('Statut requis')
    .oneOf(['En attente', 'En cours de livraison', 'Livré', 'Annulé'], 'Statut invalide'),
  commentaire: yup.string(),
});

router.post('/', auth, validate(createColisSchema), createColis);
router.get('/', auth, getColis);
router.get('/:id', auth, getColisById);
router.patch('/:id/status', auth, validate(updateStatusSchema), updateColisStatus);

export default router; 