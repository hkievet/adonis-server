import { DateTime } from 'luxon'
import { column, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import HnStory from './HnStory'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public accessToken?: string

  @column()
  public rememberMeToken?: string

  @column()
  public notionToken?: string

  @column()
  public notionTableUri?: string

  @column()
  public isVerified?: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => HnStory, {
    localKey: 'id',
    relatedKey: 'id',
    pivotTable: 'favorites',
    pivotRelatedForeignKey: 'hnstories_id',
    pivotForeignKey: 'user_id',
  })
  public stories: ManyToMany<typeof HnStory>
}
