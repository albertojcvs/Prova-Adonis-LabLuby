import { HttpContext } from '@adonisjs/http-server/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Permission from 'App/Models/Permission'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  async index() {
    return await User.query().preload('bets', (betsQuery) => {
      betsQuery
        .where('created_at', '<=', DateTime.now().toSQL())
        .where('created_at', '>', DateTime.now().minus({ days: 30 }).startOf('day').toSQL())
    }).preload('permissions')
  }

  async show({ params }: HttpContextContract) {
      const { id } = params
      const user = await User.findOrFail(id)
      await user.load('bets', (betsQuery) => {
        betsQuery
          .where('created_at', '<=', DateTime.now().toSQL())
          .where('created_at', '>=', DateTime.now().minus({ days: 30 }).startOf('day').toSQL())
      })
      await user.load('permissions')
      return user
  }

  async store({ request }: HttpContextContract) {
    const {
      username,
      email,
      password
    } = await request.validate(CreateUserValidator)

    const user = await User.create({
      username,
      email,
      password,
    })

    const permission = await Permission.findByOrFail('name', 'player')

    await user.related('permissions').attach([permission.id])

    await Mail.sendLater((message) => {
      message
        .from('albertojcvs@gmail.com')
        .to(email)
        .subject('Welcome!!!')
        .htmlView('emails/welcome', { username })
    })

    return { message: 'User has been created!', user }
  }

  async update({ params, request }: HttpContext) {

      const { id } = params

      const { username: newUsername } = await request.validate(UpdateUserValidator)
      const user = await User.findOrFail(id)

      user.username = newUsername

      await user.save()
  }

  async destroy({ params }: HttpContext) {
    const { id } = params

    const user = await User.findOrFail(id)

    await user.delete()
  }
}
