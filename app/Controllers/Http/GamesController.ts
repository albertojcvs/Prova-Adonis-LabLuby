import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import SaveGameValidator from 'App/Validators/SaveGameValidator'

export default class GamesController {
  public async index({}: HttpContextContract) {
    return await Game.all()
  }

  public async store({ request }: HttpContextContract) {
    const data = await request.validate(SaveGameValidator)

    const game = await Game.create(data)

    return game
  }

  public async show({ params }: HttpContextContract) {
    try {
      const { id } = params
      const game = await Game.findOrFail(id)
      return game
    } catch (err) {
      return 'There is no game with this id!'
    }
  }

  public async update({ params, request }: HttpContextContract) {
    try {
      const { id } = params
      const game = await Game.findOrFail(id)

      const data = await request.validate(SaveGameValidator)

      Object.assign(game, data)

      await game.save()
    } catch (err) {
      return 'There is no game with this id!'
    }
  }

  public async destroy({ params }: HttpContextContract) {
    try {
      const { id } = params
      const game = await Game.findOrFail(id)
      await game.delete()
    } catch (err) {
      return 'There is no game with this id!'
    }
  }
}
