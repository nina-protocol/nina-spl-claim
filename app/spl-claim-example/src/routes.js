import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Home from './components/Home';
import Nav from './components/Nav'
import Container from '@material-ui/core/Container';

function Routes() {
  return (
    <>
      <HashRouter basename={'/'}>
        <Container maxWidth={false} disableGutters className="main-container">
          <Nav />
          <div className="body-container" >
            <Switch>
              <Route exact path="/" component={Home} />
            </Switch>
          </div>
        </Container>
      </HashRouter>
    </>
  );
}

export default Routes
