import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import { Client } from '@notionhq/client/build/src';

Route.get('/notion/settings', async ({ auth }) => {
    const user = auth.user
    const results = {
        isAuthenticated: user?.email || "",
        notionAuthenticated: false,
        notionPages: [] as string[],
        selectedNotionPage: "",
    }

    if (user?.notionToken) {
        results.notionAuthenticated = true
        const notion = new Client({
            auth: user.notionToken
        })
        const searchResults = await notion.search({
            filter: {
                property: "object",
                value: "database"
            }
        })

        if (searchResults) {
            results.notionPages = searchResults.results.map((result) => {
                return result.id
            })
        }
        if (user?.notionTableUri) {
            results.selectedNotionPage = user.notionTableUri
        }
    }
    return results
}).middleware('auth:web')

Route.get('/notion/makeTable', async () => {
    // stub
}).middleware('auth:web')

Route.post('/notion/authenticate', async ({ request, auth }) => {
    const user = auth.user
    const body = request.body()
    let code = body.code
    const authToken = Buffer.from(`${Env.get("NOTION_CLIENT")}:${Env.get("NOTION_SECRET")}`).toString("base64")
    const authPayload = `Basic ${authToken}`
    // const authToken = `Basic ${Env.get("NOTION_CLIENT")}:${Env.get("NOTION_SECRET")}`

    try {
        const results = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "post",
            headers: new Headers({ "Authorization": authPayload, 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                code,
                "grant_type": "authorization_code",
                "redirect_uri": `${Env.get('CLIENT_SITE')}/notion-success`
            })
        })
        const data = await results.json()
        if (data['access_token'] && user) {
            user.notionToken = data["access_token"]
            user.save()
        }
    } catch (e) {
        console.error(e)
    }
    return { code }
}).middleware('auth:web')

Route.post('/notion/database-uri', async ({ response, request, auth }) => {
    const body = request.body()
    let databaseId = body.databaseId
    const user = auth.user
    if (!user?.notionToken) {
        response.status(500)
        return
    }
    if (databaseId) {
        user.notionTableUri = databaseId
        user.save()
    }
}).middleware('auth:web')

