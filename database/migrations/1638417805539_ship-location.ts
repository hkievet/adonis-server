import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ShipData1s extends BaseSchema {
  public async up() {
    this.schema.alterTable('ships', (table) => {
      table.string('location')
    })
  }

  public async down() {
    this.schema.alterTable('ships', (table) => {
      table.dropColumn('location')
    })
  }
}
