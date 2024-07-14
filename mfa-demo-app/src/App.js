import React, { useState, useEffect } from 'react';
import './App.css';
import { Button, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { httpClient } from './HttpClient';
import Keycloak from 'keycloak-js';

/*
  Init Options
*/
let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'master',
  clientId: 'test-mfa',
}

let kc = new Keycloak(initOptions);

function App() {
  const [infoMessage, setInfoMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    kc.init({
      onLoad: 'login-required', // Supported values: 'check-sso' , 'login-required'
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }).then((auth) => {
      setIsLoading(false);
      if (auth) {
        setIsAuthenticated(true);
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;
        kc.onTokenExpired = () => {
          console.log('token expired');
        }
      } else {
        kc.login();
      }
    }).catch((e) => {
      console.error("Keycloak Init Failed", e);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="App">
      <Container>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h4" component="h1">Keycloak Secured App</Typography>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button onClick={() => { setInfoMessage(kc.authenticated ? 'Authenticated: TRUE' : 'Authenticated: FALSE') }}
              variant="contained"
              sx={{ margin: 1 }}
            >
              Is Authenticated
            </Button>

            <Button onClick={() => { kc.login() }}
              variant="contained"
              color="success"
              sx={{ margin: 1 }}
            >
              Login
            </Button>

            <Button onClick={() => { setInfoMessage(kc.token) }}
              variant="contained"
              color="info"
              sx={{ margin: 1 }}
            >
              Show Access Token
            </Button>

            <Button onClick={() => { setInfoMessage(JSON.stringify(kc.tokenParsed)) }}
              variant="contained"
              color="warning"
              sx={{ margin: 1 }}
            >
              Show Parsed Access token
            </Button>

            <Button onClick={() => { setInfoMessage(kc.isTokenExpired(5).toString()) }}
              variant="contained"
              color="info"
              sx={{ margin: 1 }}
            >
              Check Token expired
            </Button>

            <Button onClick={() => { kc.updateToken(10).then((refreshed) => { setInfoMessage('Token Refreshed: ' + refreshed.toString()) }, (e) => { setInfoMessage('Refresh Error') }) }}
              variant="contained"
              sx={{ margin: 1 }}
            >
              Update Token (if about to expire)
            </Button>

            <Button onClick={() => { kc.logout({ redirectUri: 'http://localhost:3000' }) }}
              variant="contained"
              color="error"
              sx={{ margin: 1 }}
            >
              Logout
            </Button>

            <Button onClick={() => { setInfoMessage(kc.hasRealmRole('admin').toString()) }}
              variant="contained"
              color="info"
              sx={{ margin: 1 }}
            >
              has realm role "Admin"
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="body2" component="p" style={{ wordBreak: 'break-all' }} id='infoPanel'>
                  {infoMessage}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;