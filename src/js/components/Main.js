import React, { Component } from "react";
import ReactDOM from "react-dom";

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpLink = new HttpLink({ uri: '/graphql' });
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
});

import App from './App';

class Main extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    );
  }
}

export default Main;

const wrapper = document.getElementById("main");
wrapper ? ReactDOM.render(<Main />, wrapper) : false;