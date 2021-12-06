import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContext } from '@adonisjs/http-server/build/standalone'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContext) {
    const rota = ctx.request.url().split('/')[1]
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response
        .status(422)
        .send({message:`Error when try to validate the attributes in the route:${rota}`, errors:error.messages.errors})
      }


    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response
        .status(404)
        .send({error:{message:`Error when try to find a ${rota.substr(0, rota.length - 1)} with this id in database`}})
    }

    if (error.code === 'E_INVALID_AUTH_UID'|| error.code === 'E_INVALID_AUTH_PASSWORD' )  {
      return ctx.response.status(401).send({error:{message:'The email or the password are not valid!'}})
    }

    if(error.code === 'E_AUTHORIZATION_FAILURE'){
      return ctx.response.status(401).send({error:{message:'It is not possible change that not yours data'}})
    }

    return error.message
  }
}
