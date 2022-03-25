/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

import { parse, ConnectionOptions } from 'pg-connection-string'
let dbCreds: Partial<ConnectionOptions> = {}
try {
  dbCreds = parse(Env.get('DATABASE_URL'))
  console.log(dbCreds)
} catch (e) {}
// const sslProp = Object.keys(dbCreds).length
//   ? {
//       rejectUnauthorized: false,
//     }
//   : undefined

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | PostgreSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for PostgreSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i pg
    |
    */
    pg: {
      client: 'pg',
      connection: {
        host: dbCreds.host || Env.get('PG_HOST'),
        port: Number.parseInt(dbCreds.port as string, 10) || Env.get('PG_PORT'),
        user: dbCreds.user || Env.get('PG_USER'),
        password: dbCreds.password || Env.get('PG_PASSWORD', ''),
        database: dbCreds.database || Env.get('PG_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
