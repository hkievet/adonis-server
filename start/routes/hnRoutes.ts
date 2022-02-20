import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HnStory from 'App/Models/HnStory'
import fetch from "node-fetch"

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

async function searchStories(searchTerm: string): Promise<any[]> {
    let url = `https://hn.algolia.com/api/v1/search?query=${searchTerm}`;
    console.info(`Searching for results from ${url}`)
    try {
        const response = await fetch(url);
        const data = (await response.json()) as { hits: { title: string, url: string, objectID: string }[] }
        return data.hits;
    } catch (e) {
        console.error(e)
        throw Error("Couldn't fetch stories.");
    }
}

Route.get('search/:keyterm', async ({ bouncer, auth, params }) => {
    await bouncer.authorize('heezyklovaday')
    const user = auth.user
    if (!user) {
        return
    }
    await user.load('stories')
    const { keyterm } = params

    const data = await searchStories(keyterm)

    const entries = data.map(({ title, url: hnUrl, objectID: hnId }) => {
        return {
            title,
            hnUrl,
            hnId
        }
    })

    const items = await HnStory.fetchOrCreateMany('hnId', entries)
    await user.load('stories')
    const mapped = user.stories.map(s => s.id)

    const populatedItems = await Promise.all(items.map(async (i) => {
        const storyData = await i.getStoryData()
        i.title = storyData.title;
        await i.save()
        return {
            ...i.serialize(),
            ...storyData,
            isFavorited: mapped.includes(i.id)
        }
    }))


    return populatedItems
}).middleware('auth:web')
