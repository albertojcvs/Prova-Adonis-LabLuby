import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bet from 'App/Models/Bet'
import CreateBetValidator from 'App/Validators/CreateBetValidator'

export default class BetsController {
  public async index() {
    return await Bet.all()
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const { bets } = await request.validate(CreateBetValidator)
      await bets.forEach(async (bet) => {
        const betNumbersInString = bet.numbers.join(', ')
        const betAlreadyExists = await Bet.query()
          .select('*')
          .where('user_id', `${bet.user_id}`)
          .andWhere('game_id', `${bet.game_id}`)
          .andWhere('numbers', betNumbersInString)
          .first()

        if (betAlreadyExists) {
          return response.status(409).send({ message: 'Some of the bets already exits! ', bet })
        }
      })
      const newBets = await Bet.createMany(
        bets.map((bet) => {
          return {
            ...bet,
            numbers: bet.numbers.join(', '),
          }
        })
      )
      return { message: 'Bets have been created!', bets: newBets }
    } catch (err) {
      return err
      }
    }


  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
