import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Bet from './Bet'
import Permission from './Permission'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username:string

  @column()
  public email:string

  @column()
  public password:string

  @hasMany(( () => Bet), {
    foreignKey:'user_id'
  })
  public bets:HasMany<typeof Bet>

  @manyToMany(() => Permission,{
    pivotForeignKey:'user_id',
    relatedKey:'id',
    pivotRelatedForeignKey:'permission_id',
    pivotTable: 'user_permissions'
  })
  public permissions: ManyToMany<typeof Permission>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
