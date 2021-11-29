import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserPermissions extends BaseSchema {
  protected tableName = 'user_permissions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('user_id')
      .notNullable()
      .unsigned()
      .references('user.id')
      .onDelete('CASCADE')

      table.string('permission_id')
      .notNullable()
      .unsigned()
      .references('permission.id')
      .onDelete('CASCADE')

      table.unique(['user_id', 'permission_id'])
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
