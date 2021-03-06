import express from 'express';
import bodyParser from 'body-parser';
import cros from 'cors';
import https from 'https';
import fs from 'fs';
import { KiteConnect, KiteTicker } from 'kiteconnect';
import { config } from './config';
import { floor } from './indicators/pivotPoints/floor';

const app = express();
app.use(bodyParser.json());
app.use(cros());

const httpsOptions =
{
    key: fs.readFileSync(config.certKeyPath),
    cert: fs.readFileSync(config.certPath),
};

const kc = new KiteConnect({
    api_key: config.apiKey,
});

let requestToken: string;
let accessToken: string;

// send request token request
app.get('/login', (req, res) =>
{
    res.redirect(`${config.apiPath}/connect/login?v=3&api_key=${config.apiKey}`);
});

// get request token
app.get('/', async (req, res) =>
{
    requestToken = req.query.request_token;

    if (requestToken === undefined)
    {
        res.send('Error').status(400);
    }

    accessToken = await kc.generateSession(requestToken, config.secretKey)
        .then(async (response: any) =>
        {
            return response.access_token;
        })
        .catch((err: any) =>
        {
            console.log(err);
        });

    res.send('OK');

    // fs.writeFileSync(process.cwd() +  '/historicalData.json', JSON.stringify(result));
});

// feature implementation

// 1. users

// GET /user/profile Retrieve the user profile
app.get('/profile', async (req, res) =>
{
    res.send(await kc.getProfile());
});

// GET	/user/margins/:segment	Retrieve detailed funds and margin information
app.get('/margins', async (req, res) =>
{
    if (req.query.segment)
    {
        res.send(await kc.getMargins(req.query.segment));
    }
    res.send(await kc.getMargins());
});

// DELETE	/session/token	Logout and invalidate the API session and access_token
app.get('/delete', async (req, res) =>
{
    res.send(await kc.invalidateAccessToken(accessToken));
});

// 2. Orders

// POST	/orders/:variety	Place an order of a particular variety
let orderId: string;
app.post('/orders', async (req, res) =>
{
    let result;

    try
    {
        result =
            await kc.placeOrder(
                req.body.variety,
                req.body.params,
                );
    }
    catch (err)
    {
        result = err;
    }

    orderId = result.order_id;
    res.send(result);
});

// PUT	/orders/:variety/:order_id	Modify an open or pending order
app.put('/orders', async (req, res) =>
{
    let result;

    try
    {
        result =
            await kc.modifyOrder(
                req.body.variety,
                orderId,
                req.body.params,
                );
    }
    catch (err)
    {
        result = err;
    }

    res.send(result);
});

// DELETE	/orders/:variety/:order_id	Cancel an open or pending order
app.delete('/orders', async (req, res) =>
{
    res.send(await kc.cancelOrder(req.query.variety, req.query.order_id));
});

// GET	/orders	Retrieve the list of all orders (open and executed) for the day
// GET	/orders/:order_id	Retrieve the history of a given order
app.get('/orders', async (req, res) =>
{
    res.send(await kc.getOrders());
});

// GET	/trades	Retrieve the list of all executed trades for the day
// GET	/orders/:order_id/trades	Retrieve the trades generated by an order
app.get('/trades', async (req, res) =>
{
    if (req.query.order_id)
    {
        res.send(await kc.getOrderTrades(req.query.order_id));
    }
    res.send(await kc.getTrades());
});

// 3. Portfolio

// GET	/portfolio/holdings	Retrieve the list of long term equity holdings
app.get('/holdings', async (req, res) =>
{
    res.send(await kc.getHoldings());
});

// GET	/portfolio/positions	Retrieve the list of short term positions
app.get('/positions', async (req, res) =>
{
    res.send(await kc.getPositions());
});

// PUT	/portfolio/positions	Convert the margin product of an open position
app.put('/positions', async (req, res) =>
{
    res.send(await kc.convertPosition(req.body.params));
});

// 4. Market quotes and instruments

// GET	/instruments	Retrieve the CSV dump of all tradable instruments
// GET	/instruments/:exchange	Retrieve the CSV dump of instruments in the particular exchange
app.get('/instruments', async (req, res) =>
{
    if (req.query.exchange)
    {
        res.send(await kc.getInstruments(req.query.exchange));
    }
    res.send(await kc.getInstruments());
});

// GET	/quote	Retrieve full market quotes for one or more instruments
app.get('/quote', async (req, res) =>
{
    if (req.query.instruments)
    {
        res.send(await kc.getQuote(req.query.instruments));
    }
    res.send(await kc.getQuote());
});

// GET	/quote/ohlc	Retrieve OHLC quotes for one or more instruments
app.get('/quote/ohlc', async (req, res) =>
{
    if (req.query.instruments)
    {
        res.send(await kc.getOHLC(req.query.instruments));
    }
    res.send(await kc.getOHLC());
});

// GET	/quote/ltp	Retrieve LTP quotes for one or more instruments
app.get('/quote/ltp', async (req, res) =>
{
    if (req.query.instruments)
    {
        res.send(await kc.getLTP(req.query.instruments));
    }
    res.send(await kc.getLTP());
});

// 5. WebSocket streaming

app.get('/tick', async (req, res) =>
{
    const ticker  = new KiteTicker({
        api_key: config.apiKey,
        access_token: accessToken,
    });

    try
    {
        function onTicks(ticks: any) {
            console.log('Ticks', ticks);
            res.send(ticks);
        }

        function subscribe() {
            const items = [700419];
            ticker.subscribe(items);
            ticker.setMode(ticker.modeLtp, items);
        }

        ticker.connect();
        ticker.on('ticks', onTicks);
        ticker.on('connect', subscribe);
        ticker.on('error', (err: any) => console.log(err) )
    }
    catch (err)
    {
        res.send(err);
    }
});

// 6. Historical candle data

// GET	/instruments/historical/:instrument_token/:interval	Retrieve historical candle records for a given instrument.
app.get('/history', async (req, res) =>
{
    res.send(await kc.getHistoricalData(
        req.query.instrument_token,
        req.query.interval,
        req.query.from_date,
        req.query.to_date,
        req.query.continuous,
    ));
});

app.get('/test', async (req, res) =>
{
    res.send(await floor(2272.85, 2293.65, -1));
});

https.createServer(httpsOptions, app)
    .listen(config.port);
