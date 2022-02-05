import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserFavorites extends BaseSchema {
  protected tableName = 'favorites'

  public async up() {
    this.schema.alterTable('hnstories', (table) => {
      table.dropColumn('is_favorited')
    })
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('hnstories_id').references('hnstories.id')
      table.integer('user_id').references('users.id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.alterTable('hnstories', (table) => {
      table.boolean('is_favorited')
    })
  }
}
