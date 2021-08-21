const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

// import graphql
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');

const auth = require('./middleware/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // send OPTIONS request before each request, so need to allow this req
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

// the only endpoint in graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      return {
        message: err.message,
        data: err.originalError.data || 'An error occurred',
        status: err.originalError.code || 500,
      };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://sunyanl:Abcd9876@cluster0.tdztn.mongodb.net/data?retryWrites=true&w=majority',
    { useNewUrlParser: true }
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
