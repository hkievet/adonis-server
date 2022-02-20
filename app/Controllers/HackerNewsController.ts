import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HnStory from 'App/Models/HnStory'
import fetch from 'node-fetch';
import { Client } from '@notionhq/client'
import Favorite from 'App/Models/Favorite';

async function addDatabaseItem(title: string, url: string, databaseId: string, notionToken: string, hnId: number) {
    const notion = new Client({
        auth: notionToken,
    })
    if (!databaseId) {
        throw Error("No databaseId setup for Notion")
    }
    try {
        const datestring = new Date()
        await notion.pages.create({
            parent: {
                "type": "database_id",
                "database_id": databaseId
            }
            ,
            properties: {
                "Name": {
                    "type": "title",
                    "title": [{ "type": "text", "text": { "content": title } }]
                },
                "Url": {
                    "url": url
                },
                "Date Added": {
                    type: "date",
                    date: {
                        start: datestring
                    }
                },
                "HN Comments": {
                    "url": `https://news.ycombinator.com/item?id=${hnId}`
                }
            },
        } as any)
    } catch (error) {
        throw error
    }
}
async function getStories(): Promise<number[]> {
    let url = 'https://hacker-news.firebaseio.com/v0/topstories.json';
    try {
        const response = await fetch(url);
        const data = (await response.json()) as number[];
        return data.slice(0, 25);
    } catch (e) {
        throw Error("Couldn't fetch stories.");
    }
}

export default class HackerNewsController {
    public async index({ bouncer, auth }: HttpContextContract) {
        await bouncer.authorize('heezyklovaday')
        const user = auth.user
        if (!user) {
            return
        }
        await user.load('stories')

        const data = await getStories()

        const entries = data.map((hnId) => {
            return {
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
    }

    public async store({ request, bouncer, auth }: HttpContextContract) {
        await bouncer.authorize('heezyklovaday')
        const user = auth.user
        if (request.hasBody() && user) {
            const body = request.body()
            if (body.hnId && body.isFavorited) {
                const story = new HnStory()
                story.hnId = body.hnId
                const storyData = await story.getStoryData()
                story.title = storyData.title
                story.hnUrl = storyData.url
                try {
                    story.save()
                } catch (e) {
                    console.error(e)
                }
                const favorite = new Favorite()
                favorite.userId = user.id
                favorite.hnstoriesId = story.id
                try {
                    favorite.save()
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }
    public async update({ request, params, bouncer, auth }: HttpContextContract) {
        await bouncer.authorize('heezyklovaday')
        const user = auth.user
        const { id } = params
        if (request.hasBody() && id && user?.notionToken && user.notionTableUri) {
            const body = request.body()
            if (body.isFavorited !== undefined) {
                const existing = await HnStory.findByOrFail('hnId', id)
                existing.save()
                const storyData = await existing.getStoryData()
                const favorite = await Favorite.firstOrNew({ userId: user.id, hnstoriesId: existing.id })
                if (!body.isFavorited) {
                    await favorite.delete()
                }
                if (!favorite.id && body.isFavorited) {
                    favorite.userId = user.id
                    favorite.hnstoriesId = existing.id
                    existing.hnUrl
                    try {
                        favorite.save()
                    } catch (e) {
                        console.error(e)
                    }
                    await addDatabaseItem(storyData.title, storyData.url,
                        user.notionTableUri, user.notionToken, existing.hnId)

                }
                return { ...existing.$attributes, ...storyData }
            }
        }
    }

    public async show({ params, bouncer }: HttpContextContract) {
        await bouncer.authorize('heezyklovaday')
        const { id } = params
        const existing = await HnStory.findByOrFail('hnId', id)
        const storyData = await existing.getStoryData()
        return {
            ...existing.$attributes,
            ...storyData
        }
    }
}