import dotenv from 'dotenv';

dotenv.config();

export const config =
{
    basePath: process.env.KITE_END_POINT,
    apiPath: process.env.KITE_API_END_POINT,
    apiKey: process.env.KITE_API_KEY,
    secretKey: process.env.KITE_SECRET_KEY,
    port: process.env.PORT || 5001,
    certPath: `${process.cwd()}\\certs\\localhost.cert`,
    certKeyPath: `${process.cwd()}\\certs\\localhost.key`,
};
