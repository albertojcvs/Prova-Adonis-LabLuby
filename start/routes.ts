/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/', 'UsersController.store')

  Route.group(() => {
    Route.get('/', 'UsersController.index')
    Route.get('/:id', 'UsersController.show')
    Route.put('/:id', 'UsersController.update')
    Route.delete('/:id', 'UsersController.destroy')
  }).middleware('auth:api')
}).prefix('/users')

Route.group(() => {
  Route.get('/', 'GamesController.index')
  Route.get('/:id', 'GamesController.show')
  Route.group(() => {
    Route.post('/', 'GamesController.store')
    Route.put('/:id', 'GamesController.update')
    Route.delete('/:id', 'GamesController.destroy')
  }).middleware('isAdmin')
})
  .prefix('/games')
  .middleware('auth:api')

Route.group(() => {
  Route.post('/', 'BetsController.store')
  Route.get('/', 'BetsController.index')
  Route.get('/:id', 'BetsController.show')
  Route.delete('/:id', 'BetsController.destroy')
})
  .prefix('/bets')
  .middleware('auth:api')

Route.group(() => {
  Route.post('/', 'LoginController.login')
}).prefix('/login')

Route.group(() => {
  Route.get('/', 'PermissionsController.index')
  Route.get('/:id', 'PermissionsController.show')
  Route.group(() => {
    Route.post('/', 'PermissionsController.store')
    Route.put('/:id', 'PermissionsController.update')
    Route.delete('/:id', 'PermissionsController.destroy')
  }).middleware('isAdmin')
})
  .prefix('/permissions')
  .middleware('auth:api')
  .middleware('isAdmin')
