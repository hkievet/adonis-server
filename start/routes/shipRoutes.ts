import Route from '@ioc:Adonis/Core/Route'
import Ship from 'App/Models/Ship'

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
