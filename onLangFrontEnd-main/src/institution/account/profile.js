import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'
import swal from 'sweetalert';
import configData from "../../config.json";

export default class InstitutionProfile extends React.Component {

  validUserName = new RegExp('^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$')
  validPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

  constructor(props) {
    super(props);
    this.state = {
      college : "",
      firstname: "",
      lastname: "",
      position: "",
      department : "",
      email: "",
      website: "",
      phone: "",
      tel: "",
      username: "",
      password: "",
      oldusername: "",
      oldpassword: "",
      newusername: "",
      newpassword: "",
      confirmpassword: "",
      contactInfo : false,
      passwordModal : false,
      userNameMatchError : false,
      passwordMatchError : false,
      userNameError : false,
      passwordError : false,
      confirmpasswordError : false,
    };
  }
  componentDidMount () {
    axios({
      method: "get",
      url:  configData.SERVER_URL + 'college/getcollege',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : localStorage.getItem('loginToken')
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            college : resp.data.college,
            firstname : resp.data.college.firstname,
            lastname : resp.data.college.lastname,
            position : resp.data.college.designation,
            department : resp.data.college.department,
            email : resp.data.college.email,
            website : resp.data.college.website,
            phone : resp.data.college.phone,
            tel : resp.data.college.tel,
            username : resp.data.college.username,
            password : resp.data.college.password,
          });
        }else{
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
        }
      })
    .catch(err => {
      swal({
        title: "Server Not Responding",
        text: "Please reload the page",
        icon: "warning",
        button: "ok",
      });
    })
    document.getElementById("loader").style.display = "none";
  }

  contactInfoShow = (e) =>{
    this.setState({
      contactInfo : true
    })
  }
  contactInfoHide = (e) =>{
    this.setState({
      contactInfo : false
    })
  }

  passwordModalShow = (e) =>{
    this.setState({
      passwordModal : true
    })
  }
  passwordModalHide = (e) =>{
    this.setState({
      passwordModal : false
    })
  }

  handleInputChange = (e) => {
    document.getElementById(e.currentTarget.id).style.border = "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  changeContact = (e) =>{
    var flag = true;
    if(this.state.phone === "" || typeof this.state.phone === "undefined"){
      document.getElementById("phone").style.borderColor = "red";
      document.getElementById("phone").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("phone").focus();
      flag = false;
    }
    if(this.state.tel === "" || typeof this.state.tel === "undefined"){
      document.getElementById("tel").style.borderColor = "red";
      document.getElementById("tel").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("tel").focus();
      flag = false;
    }
    if(this.state.email === "" || typeof this.state.email === "undefined"){
      document.getElementById("email").style.borderColor = "red";
      document.getElementById("email").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("email").focus();
      flag = false;
    }
    if(this.state.position === "" || typeof this.state.position === "undefined"){
      document.getElementById("position").style.borderColor = "red";
      document.getElementById("position").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("position").focus();
      flag = false;
    }
    if(this.state.lastname === "" || typeof this.state.lastname === "undefined"){
      document.getElementById("lastname").style.borderColor = "red";
      document.getElementById("lastname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("lastname").focus();
      flag = false;
    }
    if(this.state.firstname === "" || typeof this.state.firstname === "undefined"){
      document.getElementById("firstname").style.borderColor = "red";
      document.getElementById("firstname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("firstname").focus();
      flag = false;
    }
    if(flag){
    document.getElementById("loader").style.display = "block";
    }else{
      return;
    }
    this.hitUpdateAPI(e);
  }

  hitUpdateAPI(e){
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('firstname', this.state.firstname);
    bodyFormData.append('lastname', this.state.lastname);
    bodyFormData.append('designation', this.state.position);
    bodyFormData.append('department', this.state.department);
    bodyFormData.append('email', this.state.email);
    bodyFormData.append('website', this.state.website);
    bodyFormData.append('phone', this.state.phone);
    bodyFormData.append('tel', this.state.tel);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'college/updatecollege',
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : localStorage.getItem('loginToken')
        },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){ 
            this.setState({
              college : resp.data.college,
              firstname : resp.data.college.firstname,
              lastname : resp.data.college.lastname,
              position : resp.data.college.designation,
              department : resp.data.college.department,
              email : resp.data.college.email,
              website : resp.data.college.website,
              phone : resp.data.college.phone,
              tel : resp.data.college.tel,
              contactInfo : false
            })
            swal({
              title: "Information Updated!",
              text: "Information Updated Successfully",
              icon: "success",
              button: "ok",
            });
          }else{
            swal({
              title: "Server Error!",
              text: "Please try again!",
              icon: "warning",
              button: "ok",
            });
          }
        })
      .catch(err => {
          console.log(err)
          document.getElementById("loader").style.display = "none";
          swal({
            title: "Server Error!",
            text: "Please try again!",
            icon: "warning",
            button: "ok",
          });
      })
  }

  validateUsername = (e) => {
    if(this.validUserName.test(e.target.value)) {
        this.setState({
          userNameError : false,
          [e.target.id]: e.target.value
        })
    }else{
      this.setState({
        userNameError : true
      })
    }
  }

  validatePassword = (e) => {
    if(this.validPassword.test(e.target.value)) {
      console.log("true")
        this.setState({
          passwordError : false,
          [e.target.id]: e.target.value
        })
    }else{
      console.log("false")
      this.setState({
        passwordError : true
      })
    }
  }


  validateConfirmPassword = (e) => {
    if(e.target.value == this.state.newpassword) {
      console.log("true")
        this.setState({
          confirmpasswordError : false,
          [e.target.id]: e.target.value
        })
    }else{
      console.log("false")
      this.setState({
        confirmpasswordError : true
      })
    }
  }


  usernameCheck = (e) => {
    if(e.target.value == this.state.username) {
        this.setState({
          userNameMatchError : false,
          [e.target.id]: e.target.value
        })
    }else{
      this.setState({
        userNameMatchError : true
      })
    }
  }

  passwordCheck = (e) => {
    if(e.target.value == this.state.password) {
        this.setState({
          passwordMatchError : false,
          [e.target.id]: e.target.value
        })
    }else{
      this.setState({
        passwordMatchError : true
      })
    }
  }

  changeLogins = (e) => {
    if(this.state.userNameMatchError || this.state.oldusername == ""){
      swal({
        title: "Incorrect Username!",
        text: "Please try again",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.passwordMatchError || this.state.oldpassword == ""){
      swal({
        title: "Incorrect Password!",
        text: "Please try again",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.userNameError){
      swal({
        title: "Invalid New Username!",
        text: "Please try again",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.passwordError){
      swal({
        title: "Invalid New Password!",
        text: "Please try again",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.passwordError){
      swal({
        title: "Confirm New Password!",
        text: "Please retype your new password for confirmation!",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.newusername == ""){
      swal({
        title: "Empty New Username!",
        text: "Please enter your new usernaem.",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    if(this.state.newpassword == ""){
      swal({
        title: "Empty New Password!",
        text: "Please enter your new password.",
        icon: "warning",
        button: "ok",
      });
      return;
    }
    document.getElementById("loader").style.display = "block";
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('username', this.state.newusername);
    bodyFormData.append('password', this.state.newpassword);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'college/updatecollegelogins',
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : localStorage.getItem('loginToken')
        },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){ 
            this.setState({
              college : resp.data.college,
              passwordModal : false
            })
            swal({
              title: "Information Updated!",
              text: "Login Updated Successfully",
              icon: "success",
              button: "ok",
            });
          }else{
            swal({
              title: "Server Error!",
              text: "Please try again!",
              icon: "warning",
              button: "ok",
            });
          }
        })
      .catch(err => {
          console.log(err)
          document.getElementById("loader").style.display = "none";
          swal({
            title: "Server Error!",
            text: "Please try again!",
            icon: "warning",
            button: "ok",
          });
      })
  }

  uploadImage = (e) => {
    console.log(e.target.files[0])
    document.getElementById("loader").style.display = "block";
    var bodyFormData = new FormData();
    bodyFormData.append('firstname', this.state.firstname);
    bodyFormData.append('lastname', this.state.lastname);
    bodyFormData.append('profile', e.target.files[0]);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'college/uploadimage',
        data: bodyFormData,
        headers: { 
          "Content-Type": "multipart/form-data",
          "authtoken" : localStorage.getItem('loginToken')
        },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){ 
            this.setState({
              college : resp.data.college
            })
          }else{
            swal({
              title: "Server Error!",
              text: "Please try again",
              icon: "warning",
              button: "ok",
            });
          }
        })
      .catch(err => {
          console.log(err)
          document.getElementById("loader").style.display = "none";
          swal({
            title: "Server Error!",
            text: "Please try again",
            icon: "warning",
            button: "ok",
          });
      })
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="loader" id="loader">
            <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100}/>
          </div>
          <section className="pricing">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Institution Profile</h3>
                    <div className="row">
                      <div className="col-lg-4 col-md-4 mt-12 mt-lg-0">
                        <div>
                          <img className="round" src={ configData.SERVER_URL_ASSETS + this.state.college.collegelogo}  width="150px" height="150px"/><br/>
                          <label for="inputTag" className="btn-buy mt-2">
                            <i class="fa fa-camera"></i> Upload
                            <input id="inputTag" type="file" style={{display:"none"}} onChange={this.uploadImage} accept="image/*"/>
                          </label>
                        </div>
                        <br/>
                        <Form.Group>
                          <Form.Label>
                            <strong>
                              {this.state.college.collegename} {this.state.college.collegetype}
                              <br/>
                              <a href={this.state.college.website} style={{color: "black"}} target="_blank">{this.state.college.website}</a>
                            </strong>
                            <br/>
                            { this.state.college.postalcode}, { this.state.college.city} 
                            <br/>
                            { this.state.college.country} 
                          </Form.Label>
                        </Form.Group>
                        <a className="btn-buy m-3" onClick={this.passwordModalShow}>Change login and password</a>
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <tbody>
                            <tr>
                              <td colSpan={2}><strong>Contact Information</strong></td>
                            </tr>
                            <tr>
                              <td>Full Name</td>
                              <td>{this.state.college.firstname} {this.state.college.lastname}</td>
                            </tr>
                            <tr>
                              <td>Position</td>
                              <td>{this.state.college.designation}</td>
                            </tr>
                            <tr>
                              <td>Department</td>
                              <td>{this.state.college.department}</td>
                            </tr>
                            <tr>
                              <td>Email</td>
                              <td>{this.state.college.email}</td>
                            </tr>
                            <tr>
                              <td>Work Phone</td>
                              <td>{this.state.college.tel}</td>
                            </tr>
                            <tr>
                              <td>Mobile Phone</td>
                              <td>{this.state.college.phone}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}><a className="btn-buy" onClick={this.contactInfoShow}>Edit</a></td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>


          <Modal show={this.state.contactInfo} onHide={this.contactInfoHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Contact Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="row">

                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="firstname">
                     <Form.Label>First Name<span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="First Name" onChange={this.handleInputChange} value={this.state.firstname}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="position">
                     <Form.Label>Position <span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="Position" onChange={this.handleInputChange} value={this.state.position}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                     <Form.Label>Email <span className="red">*</span></Form.Label>
                      <Form.Control type="email" placeholder="Email" onChange={this.handleInputChange} value={this.state.email}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                     <Form.Label>Work Phone <span className="red">*</span></Form.Label>
                      <PhoneInput id="tel" className="form-control" placeholder="Enter office phone" defaultCountry="GB" value={ this.state.tel } onChange={ tel => this.setState({ tel }) } onMouseOut={this.removeError} />
                    </Form.Group>
                  </div>

                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="lastname">
                     <Form.Label>Last Name <span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="Last Name" onChange={this.handleInputChange} value={this.state.lastname}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="department">
                     <Form.Label>Department</Form.Label>
                      <Form.Control type="text" placeholder="Department" onChange={this.handleInputChange} value={this.state.department}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="website">
                     <Form.Label>Website</Form.Label>
                      <Form.Control type="text" placeholder="Website" onChange={this.handleInputChange} value={this.state.website}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="phone">
                     <Form.Label>Mobile Phone<span className="red">*</span></Form.Label>
                      <PhoneInput id="phone" className="form-control" placeholder="Enter phone number" defaultCountry="GB" value={ this.state.phone } onChange={ phone => this.setState({ phone }) } onMouseOut={this.removeError}/>
                    </Form.Group>
                  </div>

                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.contactInfoHide}>Close</Button>
              <Button variant="warning" onClick={this.changeContact}>Save Changes</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={this.state.passwordModal} onHide={this.passwordModalHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title>Change login and password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="row">
                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="oldusername">
                     <Form.Label>Current Username<span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="Current Username" onChange={this.usernameCheck}/>
                    </Form.Group>
                    { this.state.userNameMatchError ? <Alert variant="danger">Wrong Username</Alert> : null }
                  </div>
                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="oldpassword">
                     <Form.Label>Current Password<span className="red">*</span></Form.Label>
                      <Form.Control type="password" placeholder="Current Password" onChange={this.passwordCheck}/>
                    </Form.Group>
                    { this.state.passwordMatchError ? <Alert variant="danger">Wrong Password</Alert> : null }
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="newusername">
                     <Form.Label>New Username<span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="New Username" onChange={this.validateUsername}/>
                    </Form.Group>  
                    { this.state.userNameError ? <Alert variant="danger">Username consist of alphanumeric characters along with dot(.), underscore(_), and hyphen(-).</Alert> : null }
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0"><Form.Group className="mb-3" controlId="newpassword">
                     <Form.Label>New Password<span className="red">*</span></Form.Label>
                      <Form.Control type="password" placeholder="New Password" onChange={this.validatePassword}/>
                    </Form.Group>
                    { this.state.passwordError ? <Alert variant="danger">Please use 8 characters including one digit and one special charactor</Alert> : null }
                  </div>
                  <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="confirmpassword">
                     <Form.Label>Confirm Password<span className="red">*</span></Form.Label>
                      <Form.Control type="password" placeholder="Confirm Password" onChange={this.validateConfirmPassword}/>
                    </Form.Group>
                    { this.state.confirmpasswordError ? <Alert variant="danger">Password does not match</Alert> : null }
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.passwordModalHide}>Close</Button>
              <Button variant="warning" onClick={this.changeLogins}>Save Changes</Button>
            </Modal.Footer>
          </Modal>
        </header>
      </div>
      );
    }
}