import Mail from '@ioc:Adonis/Addons/Mail'
import { BaseTask } from 'adonis5-scheduler/build'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class SendEmailToUsersWhoDontMakeBet extends BaseTask {
  public static get schedule() {
    return '0 0 9 * * *'
  }
  public static get useLock() {
    return false
  }

  public async handle() {
    const usersAndLastBet = await User.query().preload('bets', (betsQuery) => {
      betsQuery.orderBy('created_at', 'desc').limit(1)
    })
    console.log('entrou 1')

    for (const user of usersAndLastBet) {
      const lastBet = user.bets[0]
      const prazoEmSegundos = 7 * 24 * 60 * 60 // 1 semana: 7 dias * 24 horas * 60 minutos * 60 segundos
      if (lastBet) {
        if (
          DateTime.now().startOf('day').toSeconds() -
            lastBet.createdAt.startOf('day').toSeconds() >=
          prazoEmSegundos
        ) {
          console.log('entrou 2')
          await Mail.sendLater((message) => {
            message
              .from('albertojcvs@gmail.com')
              .to(user.email)
              .subject("Let's make a new bet")
              .htmlView('emails/make_new_bet', { username: user.username })
          })
        }
      } else {
        console.log('entrou 3')
        await Mail.sendLater((message) => {
          message
            .from('albertojcvs@gmail.com')
            .to(user.email)
            .subject("Let's make a new bet")
            .htmlView('emails/make_new_bet', { username: user.username,link:'http://www.google.com'})
        })
      }
    }
  }
}
