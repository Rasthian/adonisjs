/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.get('/', [() => import('#controllers/mahasiswa_controller'), 'index'])
  router.get('/:id', [() => import('#controllers/mahasiswa_controller'), 'show'])
  router.post('/', [() => import('#controllers/mahasiswa_controller'), 'store'])
  router.put('/:id', [() => import('#controllers/mahasiswa_controller'), 'update'])
  router.delete('/:id', [() => import('#controllers/mahasiswa_controller'), 'destroy'])
}).prefix('/mahasiswa')
