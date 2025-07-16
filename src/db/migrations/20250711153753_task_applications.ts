import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('task_applications', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('app_', md5(cast(random() as varchar(255))))"));

    table.string('task_id').references('id').inTable('tasks').notNullable().onDelete('CASCADE');
    table.string('applicant_id').references('id').inTable('users').notNullable();
    table
      .enum('status', ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'VALIDATED'])
      .notNullable()
      .defaultTo('PENDING');
    table.text('message').notNullable();
    table.string('validation_code').nullable(); // code généré par le prestataire
    table.dateTime('started_at').nullable(); // quand le prestataire démarre la tâche
    table.dateTime('completed_at').nullable(); // quand le prestataire marque comme terminé
    table.dateTime('validated_at').nullable(); // quand l'owner valide

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Un utilisateur ne peut postuler qu'une fois par annonce
    table.unique(['task_id', 'applicant_id']);
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('task_applications');
};
