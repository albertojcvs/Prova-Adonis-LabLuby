import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/LoginValidator'

export default class LoginCotroller {
  async login({ request, auth }: HttpContextContract) {
    try {
      const { email, password } = await request.validate(LoginValidator)

      const token = await auth.use('api').attempt(email, password)
      return token

    } catch (err) {
      return err
    }
  }
}
