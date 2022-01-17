import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Hnstories extends BaseSchema {
  protected tableName = 'hnstories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /*
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.integer('hn_id')
      table.boolean('is_favorited').defaultTo(false) // todo this should be something done later...
      table.unique(["hn_id"])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
