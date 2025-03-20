import { Request, Response } from 'express';
import { Colis } from '../models/Colis';
import { ColisStatus } from '../types/enums';
import mongoose from 'mongoose';

export const createColis = async (req: Request, res: Response) => {
  try {
    const {
      destinataire,
      poids,
      dimensions,
      valeur,
      assurance,
      adresse_depart,
      adresse_arrivee,
      date_livraison_estimee,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(destinataire)) {
      return res.status(400).json({ message: "ID de destinataire invalide" });
    }

    const colis = new Colis({
      expediteur: new mongoose.Types.ObjectId(req.user?.id),
      destinataire: new mongoose.Types.ObjectId(destinataire),
      poids,
      dimensions,
      valeur,
      assurance,
      adresse_depart,
      adresse_arrivee,
      date_livraison_estimee,
    });

    await colis.save();
    res.status(201).json(colis);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du colis" });
  }
};

export const getColis = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    
    if (req.user?.roles.includes('livreur')) {
      filter.livreur = new mongoose.Types.ObjectId(req.user.id);
    } else if (!req.user?.roles.includes('admin')) {
      filter.$or = [
        { expediteur: new mongoose.Types.ObjectId(req.user?.id) },
        { destinataire: new mongoose.Types.ObjectId(req.user?.id) }
      ];
    }

    if (req.query.statut) {
      filter.statut = req.query.statut;
    }

    const colis = await Colis.find(filter)
      .populate('expediteur', 'firstName lastName email')
      .populate('destinataire', 'firstName lastName email')
      .populate('livreur', 'firstName lastName email');

    res.json(colis);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des colis" });
  }
};

export const getColisById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de colis invalide" });
    }

    const colis = await Colis.findById(req.params.id)
      .populate('expediteur', 'firstName lastName email')
      .populate('destinataire', 'firstName lastName email')
      .populate('livreur', 'firstName lastName email');

    if (!colis) {
      return res.status(404).json({ message: "Colis non trouvé" });
    }

    if (!req.user?.roles.includes('admin') && 
        colis.expediteur.toString() !== req.user?.id && 
        colis.destinataire.toString() !== req.user?.id &&
        colis.livreur?.toString() !== req.user?.id) {
      return res.status(403).json({ message: "Non autorisé à voir ce colis" });
    }

    res.json(colis);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du colis" });
  }
};

export const updateColisStatus = async (req: Request, res: Response) => {
  try {
    const { statut, commentaire } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de colis invalide" });
    }

    const colis = await Colis.findById(req.params.id);
    if (!colis) {
      return res.status(404).json({ message: "Colis non trouvé" });
    }

    // Vérifier les permissions
    if (!req.user?.roles.includes('admin') && !req.user?.roles.includes('livreur')) {
      return res.status(403).json({ message: "Non autorisé à modifier le statut" });
    }

    colis.statut = statut;
    colis.historique.push({
      statut,
      date: new Date(),
      commentaire: commentaire || `Statut mis à jour: ${statut}`,
    });

    if (statut === ColisStatus.EN_COURS && !colis.livreur) {
      colis.livreur = new mongoose.Types.ObjectId(req.user.id);
    }

    if (statut === ColisStatus.LIVRE) {
      colis.date_livraison_reelle = new Date();
    }

    await colis.save();
    res.json(colis);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
  }
}; 