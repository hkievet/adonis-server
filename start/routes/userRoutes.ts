import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'

Route.get('/', async () => {
    return { hello: 'world' }
})

Route.post('/echo', async ({ request }) => {
    if (request.hasBody()) {
        return request.body()
    }
    return { test: "boom" }
})

Route.get("/isLoggedIn", async ({ auth }) => {
    try {
        await auth.use('web').authenticate()
    } catch (e) {
    }
    return { loggedIn: auth.use('web').isLoggedIn }
})

Route.get('/logout', async ({ auth, response }) => {
    await auth.use('web').logout()
    response.redirect(`${Env.get('CLIENT_SITE')}/login`)
})

