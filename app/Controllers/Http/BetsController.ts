import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Bet from 'App/Models/Bet'
import Game from 'App/Models/Game'
import CreateBetValidator from 'App/Validators/CreateBetValidator'

export default class BetsController {
  public async index() {
    return await Bet.all()
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const { bets } = await request.validate(CreateBetValidator)

      await bets.forEach(async (bet) => {
        const game = await Game.findOrFail(bet.game_id)

        if(bet.numbers.length > game.max_number){
          response.status(409).send('Some of the bets have more numbers than the  game max numbers!')
        }
        const betHasNumbersGreaterThanGameRange = bet.numbers.some((number) => number > game.range)
        if(betHasNumbersGreaterThanGameRange){
          response.status(409).send({message:'Some of the bets have a numbers greather than game range!'})
        }


        const betNumbersInString = bet.numbers.join(', ')

        const betAlreadyExists = await Bet.query()
          .select('*')
          .where('user_id', `${bet.user_id}`)
          .andWhere('game_id', `${bet.game_id}`)
          .andWhere('numbers', betNumbersInString)
          .first()

        if (betAlreadyExists) {
          response.status(409).send({ message: 'Some of the bets already exits! ', bet })
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

  public async show({ params }: HttpContextContract) {
    try {
      const { id } = params

      const bet = await Bet.findOrFail(id)

      return bet
    } catch (err) {
      return err
    }
  }

  public async destroy({ params }: HttpContextContract) {
    try {
      const { id } = params

      const bet = await Bet.findOrFail(id)

      await bet.delete()

      return 'Bet has been deleted!'
    } catch (err) {
      return err
    }
  }
}
