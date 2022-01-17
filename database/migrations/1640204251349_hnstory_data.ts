import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class HNStoryAddons extends BaseSchema {
  public async up() {
    this.schema.alterTable('hnstories', (table) => {
      table.string('notion_url').nullable()
      table.string('hn_url').nullable()
      table.string('title')
      table.string('type')
    })
  }

  public async down() {
    this.schema.alterTable('hnstories', (table) => {
      table.dropColumn('notion_url')
      table.dropColumn('hn_url')
      table.dropColumn('title')
      table.dropColumn('type')
    })
  }
}
