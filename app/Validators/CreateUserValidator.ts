import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    username: schema.string({ trim: true }, [
      rules.required(),
      rules.unique({
        table: 'users',
        column: 'username',
      }),
    ]),

    email: schema.string({ trim: true }, [
      rules.required(),
      rules.email(),
      rules.unique({
        table: 'users',
        column: 'email',
      }),
    ]),
    password: schema.string({ trim: true }, [rules.confirmed(), rules.required()]),
  })

  public messages = {
    'required': 'The {{ field }} is required to create a new user',
    'unique': ' The {{ field }} is not available',
    'email.email': 'The email is not in the right format',
  }
}
