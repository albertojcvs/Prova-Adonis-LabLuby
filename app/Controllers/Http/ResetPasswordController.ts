import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { DateTime } from 'luxon'
import crypto from 'crypto'

import User from 'App/Models/User'
import CreateResetPasswordValidator from 'App/Validators/CreateResetPasswordValidator'
import ResetPasswordValidator from 'App/Validators/ResetPasswordValidator'

export default class ResetPasswordController {
  public async store({ request }: HttpContextContract) {
    const { email, url } = await request.validate(CreateResetPasswordValidator)

    const user = await User.findByOrFail('email', email)
    user.token = crypto.randomBytes(10).toString('hex')
    user.token_created_at = DateTime.now()

    await user.save()

    await Mail.sendLater((message) => {
      message
        .from('albertojcvs@gmail.com')
        .to(user.email)
        .subject('Reset Password')
        .htmlView('emails/reset_password', {
          username: user.username,
          url: `${url}/?token="${user.token}`,
        })
    })
  }
  public async resetPassword({ request, response}: HttpContextContract) {
    const { password, token } = await request.validate(ResetPasswordValidator)

    const user = await User.findByOrFail('token', token)

    const periodInSeconds = 1 * 60 * 60 // 1 hour:  1 hour *  60 minutes * 60 seconds

    if (user.token && user.token_created_at) {
      const isTokenExpired =
        DateTime.now().toSeconds() - user.token_created_at.toSeconds() > periodInSeconds

      if (isTokenExpired) {
        return response.status(401).send({error:{message:'This token has expired'}})
      }

      user.password = password
      user.token = null
      user.token_created_at = null
      await user.save()

      await Mail.sendLater((message) => {
        message
          .from('albertojcvs@gmail.com')
          .to(user.email)
          .subject('Your password was reseted')
          .htmlView('emails/password_reseted', { username: user.username })
      })
    } else {
      return response.status(409).send({error:{message:'The user does not have a token!'}})
    }
  }
}
