import Game from 'App/Models/Game'
import test from 'japa'
import supertest from 'supertest'
import { createUser } from './utils/createUser'
import { loginUser } from './utils/loginUser'
const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Update a game', () => {
  test('Should be able to update a game', async (assert) => {
    const { user, password } = await createUser(true)
    const token = await loginUser(user.email, password)

    let game = await Game.firstOrFail()
    const previewType = game.type
    const previewDescription = game.description

    const type = 'JogoAtualizado'
    const description = 'Nova descrição'
    const { statusCode } = await supertest(BASE_URL)
      .put(`/games/${game.id}`)
      .send({
        type,
        description,
        range: game.range,
        color: game.color,
        price: game.price,
        max_number: game.max_number,
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    game = await Game.firstOrFail()
    assert.equal(statusCode, 200)
    assert.equal(game.type, type)
    assert.equal(game.description, description)
    await supertest(BASE_URL)
      .put(`/games/${game.id}`)
      .send({
        type: previewType,
        description: previewDescription,
        range: game.range,
        color: game.color,
        price: game.price,
        max_number: game.max_number,
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    await user.delete()
  })

  test('It should not be able to update a game without admin permission', async (assert) => {
    const { user, password } = await createUser()
    const token = await loginUser(user.email, password)
    let game = await Game.firstOrFail()
    const type = 'JogoAtualizado'
    const description = 'Nova descrição'
    const { statusCode } = await supertest(BASE_URL)
      .put(`/games/${game.id}`)
      .send({
        type,
        description,
        range: game.range,
        color: game.color,
        price: game.price,
        max_number: game.max_number,
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    game = await Game.firstOrFail()

    assert.equal(statusCode, 403)
    assert.notEqual(game.type, type)
    assert.notEqual(game.description, description)
    await user.delete()
  })

  test('It should not be able to update a game without authenticate user', async (assert) => {
    let game = await Game.firstOrFail()
    const type = 'JogoAtualizado'
    const description = 'Nova descrição'
    const { statusCode } = await supertest(BASE_URL).put(`/games/${game.id}`).send({
      type,
      description,
      range: game.range,
      color: game.color,
      price: game.price,
      max_number: game.max_number,
    })

    game = await Game.firstOrFail()

    assert.equal(statusCode, 401)
    assert.notEqual(game.type, type)
    assert.notEqual(game.description, description)
  })

  test('It should not  be able to update a game without required attributes', async (assert) => {
    const { user, password } = await createUser(true)
    const token = await loginUser(user.email, password)

    let game = await Game.firstOrFail()
    const previewType = game.type
    const previewDescription = game.description

    const type = 'JogoAtualizado'
    const description = 'Nova descrição'
    const { statusCode } = await supertest(BASE_URL)
      .put(`/games/${game.id}`)
      .send({
        type,
        description,
        color: game.color,
        price: game.price,
        max_number: game.max_number,
      })
      .set({ authorization: `Bearer ${token}`, accpet: 'application/json' })

    game = await Game.firstOrFail()
    assert.equal(statusCode, 422)
    assert.notEqual(game.type, type)
    assert.notEqual(game.description, description)

    await user.delete()
  })

})
