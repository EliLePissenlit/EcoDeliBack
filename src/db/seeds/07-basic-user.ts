/* eslint-disable @typescript-eslint/no-var-requires */
const bcryptLib2 = require('bcrypt');
const configLib2 = require('config');
const fs = require('fs');
const path = require('path');
const UserService = require('../../services/users').default;
const FileWorkflow = require('../../workflows/files').default;

exports.seed = async (knex) => {
  await knex('users').insert({
    created_at: new Date().toISOString(),
    email: 'basic@example.com',
    first_name: 'Basic',
    is_suspended: false,
    is_under_surveillance: false,
    is_user_email_verified: true,
    last_login_at: new Date().toISOString(),
    last_name: 'Basic',
    password: await bcryptLib2.hash('password', configLib2.get('security.hash.rounds')),
    password_updated_at: new Date().toISOString(),
    role: 'BASIC',
    updated_at: new Date().toISOString(),
  });

  // Récupérer le user inséré
  const user = await UserService.findByEmail('basic@example.com');
  if (!user) throw new Error('User basic@example.com not found');

  // Préparer l'objet upload pour l'avatar
  const assetsDir = path.resolve(__dirname, 'assets');
  const avatarPath = path.join(assetsDir, 'basic-user.jpeg');
  if (!fs.existsSync(avatarPath)) throw new Error('Image basic-user.jpeg non trouvée');
  const upload = {
    createReadStream: () => fs.createReadStream(avatarPath),
    encoding: '7bit',
    filename: 'basic-user.jpeg',
    mimetype: 'image/jpeg',
  };

  // Uploader l'avatar via FileWorkflow
  if (FileWorkflow && FileWorkflow.uploadAvatar) {
    await FileWorkflow.uploadAvatar({ file: upload, me: user });
  }
};
