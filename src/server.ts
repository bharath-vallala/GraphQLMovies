import express from "express";
import { graphqlHTTP } from "express-graphql";
import webpush from "web-push";
import bodyParser from "body-parser";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
} from "graphql";

const { Pool, Client } = require("pg");

var cors = require("cors");

const app = express();

const PORT = 3002;
app.use(bodyParser.json());
app.use(cors());
//db Connction

const client = new Client({
  user: "kbrgavtx",
  host: "suleiman.db.elephantsql.com",
  database: "kbrgavtx",
  password: "C9LwU73Mv-zTZndT0IkU4-yDP32R5uWC",
  port: 5432,
});
client.connect();

const publicVapid =
  "BLptAS_pUeuq60oIVLvG72rq98fdkPCP04G9Rq_smbivznYdkzoiAKUjtm-MaIVcjdEmhn_IE3dKr_GfSm3pPcY";

const PrivateVapid = "QjPXVC6lG5ZnKV-LO9mZBbv_iI9_eNVWmrGfnZq2DbM";

webpush.setVapidDetails("mailto:test@example.com", publicVapid, PrivateVapid);

let movies1: any = [
  {
    id: "1",
    gener: "action",
    name: "avengers",
    director: "Anthony Russo",
  },
  {
    id: "4",
    gener: "action",
    name: "thor",
    director: "donno",
  },
  {
    id: "2",
    gener: "comedy",
    director: "Priyadarshan",
    name: "hera pheri",
  },
  {
    id: "3",
    gener: "sicience fiction",
    director: "S. Shankar",
    name: "robo",
    cast: ["rajni kanth"],
  },
];

let MovieType = new GraphQLObjectType({
  name: "movie",
  description: "movies ",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    gener: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    director: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootSchema = new GraphQLObjectType({
  name: "Query",
  description: "root desc",
  fields: () => ({
    movie: {
      type: new GraphQLList(MovieType),
      description: "A Single Book",
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        gener: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        if (args.id) {
          let res = await client.query("select * from movies where id = $1", [
            args.id,
          ]);
          console.log(res.rows);
          return res.rows;
        }
        if (args.gener) {
          let res = await client.query(
            "select * from movies where gener = $1",
            [args.gener]
          );
          console.log(res.rows);
          return res.rows;
        }
        let res = await client.query("select * from movies where name = $1", [
          args.name,
        ]);
        console.log(res.rows);
        return res.rows;
      },
    },
    movies: {
      type: new GraphQLList(MovieType),
      description: "array of movies",
      resolve: async () => {
        let res = await client.query("select * from movies LIMIT 5;");
        console.log(res.rows);
        return res.rows;
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "add a movie",
  fields: () => ({
    addMovie: {
      type: MovieType,
      description: "Add a movie",
      args: {
        name: { type: GraphQLString },
        gener: { type: GraphQLString },
        director: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        let res = await client.query(
          "insert into movies (name,director,gener) values ($1, $2 ,$3 ) RETURNING *",
          [args.name, args.director, args.gener]
        );
        console.log(res.rows[0]);
        return res.rows[0];
      },
    },
    deleteMovie: {
      type: GraphQLList(MovieType),
      description: "delete a movie",
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        console.log("im delete");
        let res = await client.query(
          "DELETE FROM movies where id = $1 RETURNING *",
          [args.id]
        );
        console.log(res.rows);

        return res.rows;
      },
    },
    EditMovie: {
      type: GraphQLList(MovieType),
      description: "delete a movie",
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        director: { type: GraphQLString },
        gener: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        console.log("im editing");
        let res = await client.query(
          "UPDATE movies SET name = $1,director = $2, gener=$3 where id = $4 RETURNING *",
          [args.name, args.director, args.gener, args.id]
        );
        console.log(res.rows);

        return res.rows;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootSchema,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);

app.post("/subscribe", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Test" });

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
});

app.get("/", (req, res) => {
  client.query("SELECT NOW()", (err: any, res: any) => {
    console.log(res.rows[0]);
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
