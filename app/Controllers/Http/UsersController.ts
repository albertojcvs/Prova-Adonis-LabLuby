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
        .where(
          'created_at',
          '>',
          DateTime.now().minus({ days: 30 }).startOf('day').toSQL()
        )
    })
  }

  async show({ params }: HttpContextContract) {
    try {
      const { id } = params
      const user = await User.findOrFail(id)
      await user.load('bets', (betsQuery) => {
        betsQuery
        .where('created_at', '<=', DateTime.now().toSQL())
        .where(
          'created_at',
          '>=',
          DateTime.now().minus({ days: 30 }).startOf('day').toSQL()
        )
      })
      return user
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async store({ request }: HttpContextContract) {
    try {
      const {
        username,
        email,
        password,
        permission: permissionName,
      } = await request.validate(CreateUserValidator)

      const user = await User.create({
        username,
        email,
        password,
      })

      const permission = await Permission.findByOrFail('name', permissionName)

      await user.related('permissions').attach([permission.id])

      await Mail.sendLater((message) => {
        message
          .from('albertojcvs@gmail.com')
          .to(email)
          .subject('Welcome!!!')
          .htmlView('emails/welcome', { username })
      })

      return { message: 'User has been created!', user }
    } catch (err) {
      return err
    }
  }

  async update({ params, request }: HttpContext) {
    try {
      const { id } = params

      const { username: newUsername } = await request.validate(UpdateUserValidator)
      const user = await User.findOrFail(id)

      user.username = newUsername

      await user.save()
    } catch (err) {
      return err
    }
  }

  async destroy({ params }: HttpContext) {
    try {
      const { id } = params

      const user = await User.findOrFail(id)

      await user.delete()
    } catch (err) {}
  }
}
