/* eslint-disable @typescript-eslint/no-var-requires */
const bcryptLib = require('bcrypt');
const configLib = require('config');

exports.seed = async (knex) => {
  await knex('users').insert({
    created_at: new Date().toISOString(),
    email: 'partner@example.com',
    first_name: 'Jean',
    is_suspended: false,
    is_under_surveillance: false,
    is_user_email_verified: true,
    last_login_at: new Date().toISOString(),
    last_name: 'Dupont',
    password: await bcryptLib.hash('password', configLib.get('security.hash.rounds')),
    password_updated_at: new Date().toISOString(),
    role: 'PARTNER',
    updated_at: new Date().toISOString(),
  });
};
