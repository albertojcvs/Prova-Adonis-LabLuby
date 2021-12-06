import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'

import Bet from 'App/Models/Bet'
import Game from 'App/Models/Game'
import CreateBetValidator from 'App/Validators/CreateBetValidator'
import User from 'App/Models/User'

export default class BetsController {
  public async index() {
    return await Bet.all()
  }

  public async store({ request, response }: HttpContextContract) {
    const { bets } = await request.validate(CreateBetValidator)

    const betsToEmail: { numbers: number[]; game_name: string }[] = []

    for (let bet of bets) {
      const game = await Game.findOrFail(bet.game_id)

      betsToEmail.push({ numbers: bet.numbers, game_name: game.type })

      if (bet.numbers.length > game.max_number) {
        return response
          .status(409)
          .send({error:{message:'Some of the bets have more numbers than the  game max numbers!'}})
      }
      const betHasNumbersGreaterThanGameRange = bet.numbers.some((number) => number > game.range)
      if (betHasNumbersGreaterThanGameRange) {
        return response
          .status(409)
          .send({error:{ message: 'Some of the bets have a numbers greather than game range!' }})
      }

      const betNumbersInString = bet.numbers.join(', ')

      const betAlreadyExists = await Bet.query()
        .select('*')
        .where('user_id', `${bet.user_id}`)
        .andWhere('game_id', `${bet.game_id}`)
        .andWhere('numbers', betNumbersInString)
        .first()

      if (betAlreadyExists) {
        return response.status(409).send({error:{ message: 'Some of the bets already exits! ', bet }})
      }
    }

    const newBets = await Bet.createMany(
      bets.map((bet) => {
        return {
          ...bet,
          numbers: bet.numbers.join(', '),
        }
      })
    )
    const user_id = bets[0].user_id

    const user = await User.findOrFail(user_id)

    await Mail.sendLater((message) => {
      message
        .from('albertojcvs@gmail.com')
        .to(user.email)
        .subject('Your new bets!')
        .htmlView('emails/new_bets', { bets: betsToEmail, username: user.username })
    })
    return {success:{ message: 'Bets have been created!', bets: newBets }}
  }

  public async show({ params }: HttpContextContract) {
    const { id } = params

    const bet = await Bet.findOrFail(id)

    return bet
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const { id } = params
    const bet = await Bet.findOrFail(id)
    await bouncer.authorize('deleteBet', bet)

    await bet.delete()
    return {success:{message: 'User has been deleted!'}}
  }
}
