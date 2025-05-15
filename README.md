# BitFlip

[Try the app!](https://bitflip.verycool.dev)

BitFlip is an experiment to figure out if the wisdom of crowds can predict the direction of the price of Bitcoin more accurately than a coin flip. Users guess if the price of Bitcoin is higher or lower after one minute. If they are right, they get a point. If they are wrong, they lose a point.

## How it works, technically

1. The user logs in
2. The user makes a guess whether the price of Bitcoin will go up or down.
3. The time and BTC price is recorded as a Guess in the guesses table.
  a. If the user has an unresolved guess, any new guesses are not recorded.
4. An event is sent to the SQS queue, delayed by one minute.
5. The queue subscriber receives the event and fetches a new price for BTC.
  a. In case the price is exactly the same as the guess, it tries to fetch a new prive up to three times. After that the guess will be resolved with a coin flip if the price is still identical.
6. The guess resolution is recorded in the guess_resolutions table
7. After a minute has passed since the guess, the client starts polling for a resolution.
  a. This works very well, a realtime subscription was not necessary.
8. Once the client receives a new, resolved version of the guess, it shows the "correct" or "incorrect" status.
9. The client fetches a list of all resolved guesses and calculates the user points based on the realized guess resolutions.
  a. A dedicated trpc route for this can easily be added, but it has not been necessary for the current set of requirements.
  b. Guesses are mainly queried from the resolved_guesses and all_guesses views. These conveniently combine the relevant data from guesses and guess_resolutions.

## Technology

The application is implemented with the following stack:

### General

- Typescript
- Better-auth
- SST infra-as-code
- tRPC for client<->server requests
- Zod type schemas
- Bun (production Lambdas still use Node)

### Frontend

- React
- Vite
- TailwindCSS (and Shadcn components)
- React-query
- Tanstack Router
- Biome (linting and formatting)
- Motion (previously known as Framer-Motion)
- Lucide icons

### Backend

- AWS Lambda (Bun locally) for server-side logic
- AWS Aurora Serverless Postgres
- AWS SQS
- Nodemailer and an SMTP server for auth emails
- Drizzle ORM
- Hono HTTP server

### API

The app uses the [CryptoCompare API](https://developers.coindesk.com/documentation/legacy/Price/SingleSymbolPriceEndpoint) for fetching the Bitcoin price. I tried multiple alternatives, and this one worked the best. Many API's had a minute as the best price update cadence, CryptoCompare has 10 seconds (AFAIK). A realtime API would have been pretty nice, but those seemed to be quite expensive.

## Development

The project uses SST, and you need to authenticate with an AWS user who is authorized to access the organisation.

### Local prerequisites

- Bun
- Docker (or Orbstack on Macs)
- AWS CLI (and SSO configs)

### Start the project locally

1. Start a local Postgres database with Docker:

```
docker run -d \
  --rm \
  -p 5432:5432 \
  -v $(pwd)/.sst/storage/postgres:/var/lib/postgresql/data \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=local \
  postgres:16.4
```

2. Login with AWS:

```
aws sso login --sso-session=dunderfeltconsulting
```

3. After that, the local stack should start simply with:

```
bun sst dev
```

I have set the necessary secrets in the project already. They _should_ just work 🤞

After SST has done it's thing, you can visit the local frontend at [http://localhost:5173](http://localhost:5173).

The app does not send auth emails when running locally, but it will log the OTP code in the dev_server console when you log in. Use any email address.

### Deployment

To deploy a new version of the app, run:

```
bun sst deploy --stage production
```

This command should take care of everything. Push-to-deploy can be set up with the SST console, but this has not yet been enabled.

### Database migrations

The project uses Drizzle ORM for interacting with the database. When the schema (in db/schemas) is updated, a new migration needs to be generated.

1. Start the sst shell, which gives access to environment variables: `bun sst shell`
2. In the shell, run `bun drizzle-kit generate` to generate a new migration.
3. Then run `bun drizzle-kit migrate` to apply the changes.

In production, there is a migration Lambda that applies the migrations to the production database. This runs automatically on `sst deploy`, but needs the migration files present to have any effect.

### Notes

- The resolution time is 10 seconds locally, and 60 seconds in production. This is to make it more ergonomic to test the app locally.
- CryptoCompare does not require an API key for development. The API key is only used in production.

## Roadmap

The MVP works as specced, but I would like to explore the following roadmap:

- Better design, more animations, a spinning 3D Bitcoin when the user makes a guess.
- Ability to enter a guess immediately and log in while it waits for resolution.
- Investigate the need and benefit of realtime subscriptions for guess states.
- A realtime BTC price API.
- Cache BTC price with a KV store (currently in-memory which is of limited benefit in Lambdas).
- Statistics of how well (or poorly) Bitflip users are able to predict the market. This needs more users to be interesting.
- Paginated list of resolved guesses. This would also require calculating the score server-side.

## Challenges

- Finding a working set of infra was a challenge, since the SST tool and most AWS services are new to me. I had to start from a clean slate a few times when the infra got into a knot (some times were skill issues, but other times were definitely on AWS). Removing all services and re-deploying takes 15-30 minutes.
- Initially the server-side URL was not https (using an EC2 cluster), so I needed to completely restructure the server-side infra around Lambdas.
- I had hoped I would not need a domain, but CORS and cookie issues (and the above https issue) made it the path of least resistance.
- Finding a good API for the price of Bitcoin was not straight-forward. Many API's only provide price updates by the minute, which is borderline unusable for the app. Some API's just did not return correct data. CryptoCompare seems to work well enough, and they say the data is cached for 10 seconds.
- The AWS SQS queue did not want to work without providing AWS credentials. This is counter to the SST docs, but I do not see a way around it. It does need the "session token" which sounds like it will stop working at some point, but I will monitor the situation.
