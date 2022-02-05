import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import fetch from 'node-fetch'
import User from './User'

export default class HnStory extends BaseModel {
  public static table = 'hnstories'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public hnId: number

  @column()
  public title: string

  @column()
  public type: string

  @column()
  public hnUrl: string | null

  @column()
  public notionUrl: string | null

  @manyToMany(() => User, {
    localKey: 'id',
    relatedKey: 'id',
    pivotTable: 'favorites',
    pivotRelatedForeignKey: 'user_id',
    pivotForeignKey: 'hnstories_id',
  })
  public users: ManyToMany<typeof User>


  public getStoryData() {
    return HnStory.getStory(this.hnId)
  }

  public static async getStory(id): Promise<Story> {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const data = await response.json();
    return data;
  }
}
