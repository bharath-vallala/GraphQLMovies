import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
} from "graphql";
import { argsToArgsConfig } from "graphql/type/definition";
import { type } from "os";
import { resolve } from "path";

const app = express();
const PORT = 3000;

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
      resolve: (parent, args) => {
        if (args.id) {
          return movies1.filter((movie: any) => {
            console.log(args.id === movie.id);
            return movie.id === args.id;
          });
        }
        if (args.gener) {
          let res = movies1.filter((movie: any) => {
            console.log(args.gener, movie.gener);
            return movie.gener === args.gener;
          });
          console.log(res);
          return res;
        }
        let res = movies1.filter((movie: any) => {
          return movie.name === args.name;
        });
        if (res) {
          return res;
        }
      },
    },
    movies: {
      type: new GraphQLList(MovieType),
      description: "array of movies",
      resolve: () => {
        return movies1;
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
      resolve: (parent, args) => {
        const book = {
          id: movies1.length + 1,
          gener: args.gener,
          director: args.director,
          name: args.name,
        };
        movies1.push(book);
        return book;
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

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.listen(process.env.PORT || PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
