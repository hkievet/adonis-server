import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Ships extends BaseSchema {
  protected tableName = 'ships'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.string("name")
      table.string("url")
      table.integer("price")
      table.unique(["url"])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
