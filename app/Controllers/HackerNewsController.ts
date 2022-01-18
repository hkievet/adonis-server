import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HnStory from 'App/Models/HnStory'
import fetch from 'node-fetch';
import { Client } from '@notionhq/client'

if (!process.env.NOTION_TOKEN) {
    throw Error("No NOTION_TOKEN found in process")
}
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DB

async function addDatabaseItem(title, url) {
    if (!databaseId) {
        throw Error("No databaseId setup for Notion")
    }
    try {
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
                }
            },
        })
        console.log("Success! Entry added.")
    } catch (error) {
        console.error(error.body)
    }
}

export default class HackerNewsController {
    public async index(_: HttpContextContract) {
        let url = 'https://hacker-news.firebaseio.com/v0/topstories.json';
        async function getStories(): Promise<number[]> {
            try {
                const response = await fetch(url);
                const data = (await response.json()) as number[];
                return data.slice(0, 25);
            } catch (e) {
                throw Error("Couldn't fetch stories.");
            }
        }

        const data = await getStories()

        // combine each id with the database, or make a new entry...
        // const existing = await (await HnStory.query().whereIn('hnId', data))

        const entries = data.map((hnId) => {
            return {
                hnId
            }
        })

        const items = await HnStory.updateOrCreateMany('hnId', entries)

        const populatedItems = await Promise.all(items.map(async (i) => {
            const storyData = await i.getStoryData()
            return {
                ...i.$attributes,
                ...storyData
            }
        }))


        return populatedItems
    }
    public async store({ request }: HttpContextContract) {
        if (request.hasBody()) {
            const body = request.body()
            if (body.hnId && body.isFavorited) {
                const story = new HnStory()
                story.hnId = body.hnId
                story.isFavorited = body.isFavorited
                const storyData = await story.getStoryData()
                story.title = storyData.title
                story.hnUrl = storyData.url
                try {
                    story.save()
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }
    public async update({ request, params }: HttpContextContract) {
        const { id } = params
        if (request.hasBody() && id) {
            const body = request.body()
            if (body.isFavorited !== undefined) {
                const existing = await HnStory.findByOrFail('hnId', id)
                existing.isFavorited = body.isFavorited
                existing.save()
                const storyData = await existing.getStoryData()
                if (existing.isFavorited) {
                    await addDatabaseItem(storyData.title, storyData.url)
                }
                return { ...existing.$attributes, ...storyData }
            }
        }
    }

    public async show({ params }: HttpContextContract) {
        const { id } = params
        const existing = await HnStory.findByOrFail('hnId', id)
        const storyData = await existing.getStoryData()
        return {
            ...existing.$attributes,
            ...storyData
        }
    }
}