import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CssBaseline, Container } from '@material-ui/core';
import TransactionDashboard from './components/TransactionDashboard';
import FraudAlerts from './components/FraudAlerts';
import RiskReports from './components/RiskReports';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="lg">
        <Switch>
          <Route exact path="/" component={TransactionDashboard} />
          <Route path="/alerts" component={FraudAlerts} />
          <Route path="/reports" component={RiskReports} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App;