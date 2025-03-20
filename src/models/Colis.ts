import mongoose from 'mongoose';
import { ColisStatus } from '../types/enums';

const colisSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  livreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  statut: {
    type: String,
    enum: Object.values(ColisStatus),
    default: ColisStatus.EN_ATTENTE,
    required: true,
  },
  poids: {
    type: Number,
    required: true,
  },
  dimensions: {
    type: String,
  },
  valeur: {
    type: Number,
  },
  assurance: {
    type: Boolean,
    default: false,
  },
  adresse_depart: {
    type: String,
    required: true,
  },
  adresse_arrivee: {
    type: String,
    required: true,
  },
  date_envoi: {
    type: Date,
    default: Date.now,
  },
  date_livraison_estimee: {
    type: Date,
  },
  date_livraison_reelle: {
    type: Date,
  },
  code_confirmation: {
    type: String,
    unique: true,
    sparse: true,
  },
  suivi: {
    type: String,
    unique: true,
    sparse: true,
  },
  historique: [{
    statut: String,
    date: { type: Date, default: Date.now },
    commentaire: String
  }],
});

colisSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.suivi = `ECO-${dateStr}-${random}`;
    
    this.set('historique', [{
      statut: this.statut,
      date: this.date_envoi,
      commentaire: 'Colis créé'
    }]);
  }
  next();
});

export const Colis = mongoose.model('Colis', colisSchema); 