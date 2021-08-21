const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'Invalid email' });
    }
    if (
      !validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Invalid password' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input!');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    // check if database already have such user
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error('User already existed!');
    }

    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function ({ email, password }) {
    // check user existence
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.code = 404;
      throw error;
    }

    // check pw
    const isEqual = bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is invalid');
      error.code = 401;
      throw error;
    }

    // generate token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      'secretstring',
      { expiresIn: '1h' }
    );

    return { token, userId: user._id.toString() };
  },
  createPost: async function ({ postInput }) {
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: 'Invalid title' });
    }

    if (
      validator.isEmpty(postInput.content) ||
      validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: 'Invalid content' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input!');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
    });

    const createdPost = await post.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
};
