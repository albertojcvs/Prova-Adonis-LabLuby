import Game from 'App/Models/Game'
import Permission from 'App/Models/Permission'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Create a game', () => {
  test('It shouldd be able to create a game', async (assert) => {
    const email = 'admin@admin.com'
    const password = '12345'
    const userAdmin = await User.create({
      username: 'admin',
      email,
      password,
    })

    const adminPermission = await Permission.findByOrFail('name', 'admin')

    userAdmin.related('permissions').attach([adminPermission.id])

    const loginResponse = await supertest(BASE_URL).post('/login').send({
      email,
      password,
    })

    const { token } = JSON.parse(loginResponse.text).token
    const type = 'Timeamania'
    const { statusCode } = await supertest(BASE_URL)
      .post('/games')
      .send({
        type,
        description:
          'Escolha 10 números e 1 time do coração. Você ganha acertando 7, 6, 5, 4 ou 3 números ou acertando o time',
        range: 80,
        price: 3,
        max_number: 10,
        color: '#FBDB30',
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    const game = await Game.findBy('type', type)
    assert.equal(statusCode, 200)
    assert.exists(game)

    await game?.delete()
    await (await User.findByOrFail('email', email)).delete()
  })

  test('It should not be able to createa a game without have admin permission', async (assert) => {
    const email = 'user@user.com'
    const password = '12345'
    const user = await User.create({
      username: 'user',
      email,
      password,
    })

    const { text } = await supertest(BASE_URL).post('/login').send({
      email,
      password,
    })

    const { token } = JSON.parse(text).token
    const type = 'Timeamania'
    const { statusCode } = await supertest(BASE_URL)
      .post('/games')
      .send({
        type,
        description:
          'Escolha 10 números e 1 time do coração. Você ganha acertando 7, 6, 5, 4 ou 3 números ou acertando o time',
        range: 80,
        price: 3,
        max_number: 10,
        color: '#FBDB30',
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    const game = await Game.findBy('type', type)

    assert.equal(statusCode, 403)
    assert.notExists(game)
    await game?.delete()
    await  user.delete()
    })
  test('It should no be able to create a game without authenticate user', async (assert) => {
    const email = 'admin@admin.com'
    const password = '12345'
    const userAdmin = await User.create({
      username: 'admin',
      email,
      password,
    })

    const adminPermission = await Permission.findByOrFail('name', 'admin')

    userAdmin.related('permissions').attach([adminPermission.id])

    const type = 'Timeamania'
    const { statusCode } = await supertest(BASE_URL).post('/games').send({
      type,
      description:
        'Escolha 10 números e 1 time do coração. Você ganha acertando 7, 6, 5, 4 ou 3 números ou acertando o time',
      range: 80,
      price: 3,
      max_number: 10,
      color: '#FBDB30',
    })

    const game = await Game.findBy('type', type)
    await game?.delete()
    assert.equal(statusCode, 401)
    assert.notExists(game)
    await userAdmin.delete()
  })

  test('It should not be able to create a game without required attrbiutes', async (assert) => {
      const email = 'admin@admin.com'
      const password = '12345'
      const userAdmin = await User.create({
        username: 'admin',
        email,
        password,
      })

      const adminPermission = await Permission.findByOrFail('name', 'admin')

      userAdmin.related('permissions').attach([adminPermission.id])

      const loginResponse = await supertest(BASE_URL).post('/login').send({
        email,
        password,
      })

      const { token } = JSON.parse(loginResponse.text).token
      const type = 'Timeamania'
      const { text,statusCode } = await supertest(BASE_URL)
        .post('/games')
        .send({
          type,
          description:
            'Escolha 10 números e 1 time do coração. Você ganha acertando 7, 6, 5, 4 ou 3 números ou acertando o time',
          price: 3,
          max_number: 10,
          color: '#FBDB30',
        })
        .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

      assert.equal(statusCode,422)
      assert.hasAnyKeys(JSON.parse(text), ['errors'])
  })
})
