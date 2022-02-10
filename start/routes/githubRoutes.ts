import Route from '@ioc:Adonis/Core/Route'
import allyConfig from 'Config/ally';
import User from 'App/Models/User';
import Env from '@ioc:Adonis/Core/Env'

Route.get('/github/redirect', async ({ ally }) => {
    return ally.use('github').redirect()
})


Route.get('/github/callback', async ({ ally }) => {
    const github = ally.use('github')
    /**
     * User has explicitly denied the login request
     */
    if (github.accessDenied()) {
        return 'Access was denied'
    }
    /**
     * Unable to verify the CSRF state
     */
    if (github.stateMisMatch()) {
        return 'Request expired. Retry again'
    }
    /**
     * There was an unknown error during the redirect
     */
    if (github.hasError()) {
        return github.getError()
    }
    /**
     * Finally, access the user
     */
    // const user = await github.user()
})

Route.get('/github/checkToken', async ({ request, ally, auth }) => {
    let code = request.headers().authorization
    if (code?.indexOf("Bearer") !== -1) {
        code = code!.substring(7).trim()
        const payload = { client_id: allyConfig.github.clientId, code: code, client_secret: allyConfig.github.clientSecret, redirect_uri: `${Env.get('CLIENT_SITE')}/success`, scope: `user:email` }
        // const payload = { client_id: allyConfig.github.clientId, code: code, client_secret: allyConfig.github.clientSecret }
        let urlParameters = Object.entries(payload).map(e => e.join('=')).join('&');
        let data
        try {
            const response = await fetch(`https://github.com/login/oauth/access_token?${urlParameters}`, { method: "post" })
            data = await response.text()
        } catch (e) {
            console.error("Error authenticating with github")
            throw e
        }
        const token = data.split('=')[1].split('&')[0]
        const githubUser = await ally
            .use('github')
            .userFromToken(token)

        if (!githubUser.email || !githubUser.token.token || !githubUser.emailVerificationState) {
            throw new Error("Expected token and email from github..")
        }

        const verified = githubUser.emailVerificationState
        const email = githubUser.email
        const accessToken = githubUser.token.token

        const user = await User.firstOrCreate({
            email: email,
        }, {
            email: email,
            isVerified: verified === 'verified',
            accessToken
        })

        await auth.use('web').login(user, true)
        return { success: true }
    }
    return { success: false }
})