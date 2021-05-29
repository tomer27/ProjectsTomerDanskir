import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import allReducers from './Reducers/index';
import { Route,BrowserRouter as Router, Switch } from 'react-router-dom';
import {createStore} from 'redux';
import Register from './Register';
import Menu from './Menu';
import Login from './Login';
import Game from './Game';
import Friends from './Friends';

const store = createStore(allReducers,  
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <Switch>
        <Route path="/" exact="true">
          <Login></Login>
        </Route>
        <Route path="/register" exact="true">
          <Register></Register>
        </Route>
        <Route path="/menu" exact="true">
          <Menu></Menu>
        </Route>
        <Route path="/game" exact="true">
          <Game></Game>
        </Route>
        <Route path="/friends" exact="true">
          <Friends></Friends>
        </Route>
      </Switch>
    </Provider>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
