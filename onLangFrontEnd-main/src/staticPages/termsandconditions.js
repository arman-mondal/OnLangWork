import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './style.css'

import {Container, Card} from "react-bootstrap";


export default class TermsandConditions extends React.Component {

  render(){
    return (
      <div className="App">
        <header className="App-header">
            <Container className="p-3">
              <Card>  
                <iframe className="term-condition" src="https://www.iubenda.com/terms-and-conditions/28001190" />
              </Card>
            </Container>
        </header>
      </div>
    );
  }
}