import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject
} from '@apollo/client';

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.REACT_APP_GRAPHQL_HOST
  uri: `http://${process.env.REACT_APP_GRAPHQL_HOST}:4000`
});

// Add some helpers to the window for easily retrieving params from the URL
declare global {
  interface Window { 
    params: (key: string, value: string) => string;
    exp: (key: string) => boolean;
  }
}

const searchParams = (new URL(document.location.toString())).searchParams;
function params(key: string, defaultValue: string = "") {
  const val = searchParams.get(key);
  if (val == null) {
    return defaultValue;
  }
  return val;
}

const exps = params("exp", "").split(",");
function exp(key: string): boolean {
  return exps.includes(key);
}

window.params = params
window.exp = exp

// Start the react app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <div className="App">
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </div>
);
