import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/LoginValidator'

export default class LoginCotroller {
  async login({ request, auth }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    const token = await auth.use('api').attempt(email, password)
    return token
  }
  async logout({auth}:HttpContextContract){
    await  auth.use('api').revoke()
    return {success:{message:'User logout'}}
  }
}
