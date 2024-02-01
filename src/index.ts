import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";

import { runCronScheduler } from "./cron/cron-index";
import { InitializePassport } from "./passport/passport-config";

import { ApolloServer, ApolloError } from "apollo-server-express";
import { GraphQLError } from "graphql";

import routers from "./routes/routers";
import schemas from "./graphql-schemas/schema";

import { createClient } from "redis";
import { setupSocket } from "./socket/socket";

const dotenv = require("dotenv").config();
const app = express();

const RedisStore = require("connect-redis")(session);
const redis_port: any = process.env.REDIS_PORT || 6379;
const store_redis_client = createClient({ legacyMode: true });
store_redis_client.connect().catch(console.error);

export const redis_client = createClient(redis_port);
redis_client.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://159.223.39.105:3000",
  "https://clettr.com:3000",
];
const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// ----> Passport JS
InitializePassport(passport);
app.use(cookieParser(process.env.SESSION_SECRET_CODE));
app.use(
  session({
    store: new RedisStore({ client: store_redis_client }),
    secret: process.env.SESSION_SECRET_CODE,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1.21e9, //? -> 14 days sync this with user sessions in user_resolvers and cronjobs
      sameSite: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
// ----> Passport JS

// ----> Apollo GraphQL
const server = new ApolloServer({
  modules: [...schemas],
  context: ({ req }: any) => ({
    user: req.user,
    redis_client: redis_client,
    logout: () => req.logout(),
  }),
  formatError: (error: GraphQLError) => {
    if (error.originalError instanceof ApolloError) {
      return error;
    }
    console.log(error);
    return new GraphQLError(`Internal Error.`);
  },
});

(async () => {
  await server.start();
  await server.applyMiddleware({ app, path: "/graphql", cors: corsOptions });
})();

// ----> Apollo GraphQL

// ---> Routers
app.use("/", routers);
// ---> Routers

setupSocket(app, allowedOrigins);

// -> cron jobs for cleaning database
runCronScheduler();

//! -> DO NOT USE localhost here only use 0.0.0.0 as connection would be refused if request is sent outside brower (mainly for testing purposes)
createConnection()
  .then(async () => {
    app.listen(8878, "localhost", () =>
      console.log("Server up at localhost:" + process.env.PORT)
    );
    // app.listen(8878, 'localhost')
  })
  .catch((error) => console.log(error));
