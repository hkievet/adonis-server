import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

Route.group(() => {
    Route.resource('hn_news', 'HackerNewsController')
}).middleware('auth:web')

Route.get('favorites', async ({ auth, bouncer }: HttpContextContract) => {
    await bouncer.authorize('heezyklovaday')
    const user = auth.user
    if (!user) {
        return
    }
    await user.load('stories')
    if (user) {
        await user.load('stories')
        user.stories.sort((a, b) => { return a.createdAt < b.createdAt ? 1 : -1 })
        const data = await Promise.all(user.stories.map(async s => {
            const storyData = await s.getStoryData(); return {
                ...s.serialize(),
                ...storyData,
                isFavorited: true
            }
        }))
        return data
        // }
    }
}).middleware('auth:web')
