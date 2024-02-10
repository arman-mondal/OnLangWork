import './profiling.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../config.json";
import {Form, Button, Card, Row, Alert} from "react-bootstrap";

export default class Login extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      show: 0
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
            <Card className="p-3">
              <Form onSubmit={(e) => this.loginApiCall(e)}>
                  <h1 className="text-center head-color">Log in</h1>
                  <hr/>
                  { this.state.show === 1 ? <Alert variant="success"> Login successful</Alert> : null }
                  { this.state.show === 2 ? <Alert variant="danger"> Invalid username or Password</Alert> : null }
                  { this.state.show === 3 ? <Alert variant="warning"> Server not responding</Alert> : null }
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Control type="text" placeholder="Enter your email" onChange={() => this.setState({ show : 0 })}/>
                    <Form.Text className="text-muted">
                      We'll never share your information with anyone else.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Control type="password" placeholder="Password" onChange={() => this.setState({ show : 0 })}/>
                  </Form.Group>
                  <Form.Group className="mb-2 d-flex" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Remember me"/>
                    <a href="/forgetpassword" className="forgetPassword">
                      Reset Password
                    </a>
                  </Form.Group>
                  <Row className="p-2">
                    <Button variant="warning" type="submit">
                      Login
                    </Button>
                  </Row>
              </Form>
            </Card>
        </header>
      </div>
    );
  }

  loginApiCall = (e) => {
    e.preventDefault();
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('email', document.getElementById('email').value);
    bodyFormData.append('password', document.getElementById('password').value);
    axios({
      method: "post",
      url: configData.SERVER_URL + 'auth/login',
      data: bodyFormData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then(resp => {
        if(resp.data.code === 200){
          this.setState({
            show : 1,
          })
          this.props.updateToken(resp.data.token);
          localStorage.setItem('loginToken', resp.data.token);
          window.location.href = "/dashboard";
        }else{
          this.setState({
            show : 2
          })
        }
        console.log(resp.data)
      })
    .catch(err => {
          this.setState({
            show : 3
          })
      console.log(err)
    })
  }
}
