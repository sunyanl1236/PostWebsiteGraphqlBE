import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphqlQuery = {
      query: `{
        getPostByID(id: ${postId}) {
          title
          creator {
            name
          }
          content
          imageUrl
          createdAt
        }
      }`,
    };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(),
    })
      .then((res) => {
        return res.json(graphqlQuery);
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error('Failed to fetch post');
        }
        this.setState({
          title: resData.data.getPostByID.title,
          author: resData.data.getPostByID.creator.name,
          image: 'http://localhost:8080/' + resData.data.getPostByID.imageUrl,
          date: new Date(resData.data.getPostByID.createdAt).toLocaleDateString(
            'en-US'
          ),
          content: resData.data.getPostByID.content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
