import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserWithNotions extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('notion_token')
      table.string('notion_table_uri')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notion_token')
      table.dropColumn('notion_table_uri')
    })
  }
}

