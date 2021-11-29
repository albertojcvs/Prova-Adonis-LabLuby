import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Permission from 'App/Models/Permission'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class UsersController {
  async store({ request,response }: HttpContextContract) {
    try {
      const { username, email, password, permission:permissionName } = await request.validate(CreateUserValidator)

      const user = await  User.create({
        username,
        email,
        password,
      })

      const permission = await Permission.findByOrFail('name', permissionName)

    await user.related('permissions').attach([permission.id])


      response.status(200).send("User has been created!")
    } catch (err) {
    response.send(err)
    }
  }
}
