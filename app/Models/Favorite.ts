import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import HnStory from './HnStory'

export default class Favorite extends BaseModel {
    public static table = 'favorites'

    @column({ isPrimary: true })
    public id: number

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @column()
    public userId: Number

    @column()
    public hnstoriesId: Number

    @hasOne(() => User, { foreignKey: 'userId' })
    public user: HasOne<typeof User>

    @hasOne(() => HnStory, { foreignKey: 'hnstoriesId' })
    public story: HasOne<typeof HnStory>
}
