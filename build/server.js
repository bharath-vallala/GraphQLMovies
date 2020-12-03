"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const graphql_1 = require("graphql");
const app = express_1.default();
const PORT = 3000;
let movies1 = [
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
let MovieType = new graphql_1.GraphQLObjectType({
    name: "movie",
    description: "movies ",
    fields: () => ({
        id: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        gener: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        name: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        director: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    }),
});
const RootSchema = new graphql_1.GraphQLObjectType({
    name: "Query",
    description: "root desc",
    fields: () => ({
        movie: {
            type: new graphql_1.GraphQLList(MovieType),
            description: "A Single Book",
            args: {
                id: { type: graphql_1.GraphQLString },
                name: { type: graphql_1.GraphQLString },
                gener: { type: graphql_1.GraphQLString },
            },
            resolve: (parent, args) => {
                if (args.id) {
                    return movies1.filter((movie) => {
                        console.log(args.id === movie.id);
                        return movie.id === args.id;
                    });
                }
                if (args.gener) {
                    let res = movies1.filter((movie) => {
                        console.log(args.gener, movie.gener);
                        return movie.gener === args.gener;
                    });
                    console.log(res);
                    return res;
                }
                let res = movies1.filter((movie) => {
                    return movie.name === args.name;
                });
                if (res) {
                    return res;
                }
            },
        },
        movies: {
            type: new graphql_1.GraphQLList(MovieType),
            description: "array of movies",
            resolve: () => {
                return movies1;
            },
        },
    }),
});
const RootMutationType = new graphql_1.GraphQLObjectType({
    name: "Mutation",
    description: "add a movie",
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: "Add a movie",
            args: {
                name: { type: graphql_1.GraphQLString },
                gener: { type: graphql_1.GraphQLString },
                director: { type: graphql_1.GraphQLString },
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
const schema = new graphql_1.GraphQLSchema({
    query: RootSchema,
    mutation: RootMutationType,
});
app.use("/graphql", express_graphql_1.graphqlHTTP({
    graphiql: true,
    schema: schema,
}));
app.get("/", (req, res) => res.send("Express + TypeScript Server"));
app.listen(process.env.PORT || PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
