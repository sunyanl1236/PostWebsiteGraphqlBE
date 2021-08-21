const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        password: String
        email: String!
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        name: String!
        password: String!
        email: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    input PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getAllPosts(page: Int!): PostData!
        getPostByID(id: ID!): Post!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
