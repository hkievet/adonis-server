import Route from '@ioc:Adonis/Core/Route'

export const PDX_COORDS = {
    lat: 45.5152,
    lon: -122.6784,
};


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
