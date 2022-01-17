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
import fetch from 'node-fetch'

import Route from '@ioc:Adonis/Core/Route'
import Ship from 'App/Models/Ship'

export const PDX_COORDS = {
  lat: 45.5152,
  lon: -122.6784,
};

Route.resource('hn_news', 'HackerNewsController')

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/name', async () => {
  return { first: 'Hunter', last: 'Kievet' }
})

Route.post('/echo', async ({ request }) => {
  if (request.hasBody()) {
    console.log(request.body())
    return request.body()
  }
  return { test: "boom" }
})

/**
 * This conversion should be done on the client side
 */
function priceToNumber(price) {
  if (typeof price === 'string') {
    if (price === 'Request a Price') {
      price = -1
    } else {
      var number = Number(price.replace(/[^0-9.-]+/g, ""));
      price = number
    }
  }
  return price
}

Route.post('/ship', async ({ request }) => {
  if (request.hasBody()) {
    const body = request.body()
    if (body.name && body.price && body.url && body.location) {
      const ship = new Ship()
      ship.name = body.name
      ship.price = priceToNumber(body.price)
      ship.url = body.url
      ship.location = body.location
      try {
        await ship.save()
      } catch (e) {
        // todo try updating the ship if it exists *shrug*
        const ship = await Ship.findBy('url', body.url)
        if (ship) {
          // update ship to match...
          ship.name = body.name;
          ship.price = priceToNumber(body.price)
          ship.location = priceToNumber(body.location)
          await ship.save
          return { ...ship, exists: true }
        }
      }
      return ship
    }
  }
})

Route.get('/ship', async () => {
  const allShips = await Ship.all()
  return allShips
})

/*
Strangely this is caching the response for 12/30... Real confused!!!
*/
Route.get('/weather', async () => {
  // const url = `https://api.weather.gov/gridpoints/PQR/${encodeURIComponent(PDX_COORDS.lat)},${encodeURIComponent(PDX_COORDS.lon)}/forecast`
  const url = `https://api.weather.gov/points/${PDX_COORDS.lat},${PDX_COORDS.lon}`
  try {
    const response = await fetch(
      url
    );
    let data = await response.json();
    if (data.properties && data.properties.forecast) {
      const response = await fetch(
        data.properties.forecast
      );
      data = await response.json();
      return data
    }
  } catch (e) {
    console.error("issue retrieving weather data")
  }
})
