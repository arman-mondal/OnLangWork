import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';
import {Card} from "react-bootstrap";


export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    console.log(this.props.userName);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
            <Card className="p-3">
              
            </Card>
        </header>
      </div>
    );
  }
}