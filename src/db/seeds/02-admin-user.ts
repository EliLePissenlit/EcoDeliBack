/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcrypt');
const config = require('config');
const fsLib2 = require('fs');
const pathLib2 = require('path');
const UserServiceLib2 = require('../../services/users').default;
const FileWorkflowLib2 = require('../../workflows/files').default;

exports.seed = async (knex) => {
  await knex('users').insert({
    email: 'admin@ecodeli.fr',
    first_name: 'Admin',
    last_name: 'EcoDeli',
    password: await bcrypt.hash('password', config.get('security.hash.rounds')),
    role: 'ADMIN',
  });

  // Récupérer l'admin inséré
  const user = await UserServiceLib2.findByEmail('admin@ecodeli.fr');
  if (!user) throw new Error('User admin@ecodeli.fr not found');

  // Préparer l'objet upload pour l'avatar
  const assetsDir = pathLib2.resolve(__dirname, 'assets');
  const avatarPath = pathLib2.join(assetsDir, 'admin.png');
  if (!fsLib2.existsSync(avatarPath)) throw new Error('Image admin.png non trouvée');
  const upload = {
    createReadStream: () => fsLib2.createReadStream(avatarPath),
    encoding: '7bit',
    filename: 'admin.png',
    mimetype: 'image/png',
  };

  // Uploader l'avatar via FileWorkflow
  if (FileWorkflowLib2 && FileWorkflowLib2.uploadAvatar) {
    await FileWorkflowLib2.uploadAvatar({ file: upload, me: user });
  }
};
