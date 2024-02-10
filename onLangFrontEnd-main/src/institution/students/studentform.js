import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card} from "react-bootstrap";
import swal from 'sweetalert';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete';
import configData from "../../config.json";

export default class StudentForm extends React.Component {

  constructor(props) {
    super(props);
    console.log(this.props.match.params.token);
    this.state = {
      fields : [],
      studylevel : [],
      student : "",
      collegename : "",
      firstname : "",
      lastname : "",
      email : "",
      phone : "",
      password : "",
      dateofbirth : "",
      fieldofstudy : "",
      levelofstudy : "",
      citizenship : "",
      city : "",
      country : "",
      passwordErrorLabel : false,
      passwordErrorMessage : "",
    }
  }
  componentDidMount () {
    axios({
      method: "get",
      url: configData.SERVER_URL + 'students/getStudentFormInfo',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : this.props.match.params.token
      },
    }).then(resp => {
        console.log("Jawad")
        console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            email : resp.data.student.email,
            fields : resp.data.field,
            studylevel : resp.data.studylevel,
            student : resp.data.student,
            collegename : resp.data.student.college.collegename,
          });
        }else{
          window.location = "/home";
        }
      })
    .catch(err => {
        console.log(err)
        window.location = "/home";
    })
    window.initMap = this.initMap
    const gmapScriptEl = document.createElement(`script`)
    gmapScriptEl.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbW7sUOtCHtwO_QhbEsp8hjmlDwERkMWE&libraries=places&callback=initMap`
    document.querySelector(`body`).insertAdjacentElement(`beforeend`, gmapScriptEl)
    document.getElementById("loader").style.display = "none";
  }


  initMap = () => {
    this.setState({
      gmapsLoaded: true,
    })
  }

  handleChange = address => {
    this.setState({ address });

  };

  handleSelect = address => {
    this.setState({ address });
    document.getElementById("city").style.border = "1px solid #ced4da";
    document.getElementById("city").style.boxShadow = "";
    geocodeByAddress(address)
      .then(
        results => {
          console.log('Success', results)
          this.setState({
            city : results[0].formatted_address,
          });
          for (var i = 0; i < results[0].address_components.length; i++) {
            var addressType = results[0].address_components[i].types[0];
            if (addressType === "country") {
              this.setState({
                country : results[0].address_components[i].long_name,
              });
            }
          }
        });
  }

  handleInputChange = (e) => {
    e.preventDefault();
    document.getElementById(e.currentTarget.id).style.border = "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
    console.log(e.target.value);
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  submit =async (e) => {
    var flag = true;
    if(this.state.firstname === "" || typeof this.state.firstname === "undefined"){
      document.getElementById("firstname").style.borderColor = "red";
      document.getElementById("firstname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("firstname").focus();
      flag = false;
    }
    if(this.state.lastname === "" || typeof this.state.lastname === "undefined"){
      document.getElementById("lastname").style.borderColor = "red";
      document.getElementById("lastname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("lastname").focus();
      flag = false;
    }
    
    
    
   
    
    if(this.state.password === "" || typeof this.state.password === "undefined"){
      document.getElementById("password").style.borderColor = "red";
      document.getElementById("password").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("password").focus();
      flag = false;
    }
   
    
    if(!flag){
      console.log("flag false hai")
    }
    if(flag){
      console.log("hitt")
      document.getElementById("loader").style.display = "block";
   this.hitRegisterAPI(e);
    }

  }
  fakeAPICall = async () => {
    // Simulate a delay (remove this in actual code)
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Replace this with your actual API call logic
  };

    hitRegisterAPI = async (e) => {
    e.preventDefault();  
  
   var data={
      studentid:this.state.student.studentid,
      email:this.state.email,
      firstname:this.state.firstname,
      lastname:this.state.lastname,
      phone:this.state.phone,
      password:this.state.password,
      citizenship:this.state.citizenship,
      dateofbirth:this.state.dateofbirth,
      fieldofstudy:this.state.fieldofstudy,
      levelofstudy:this.state.levelofstudy,
      city:this.state.city,
      country:this.state.country,


    }
  
  console.log({name:configData.SERVER_URL + 'students/updateStudentinfo/'})
  console.log({data:data})
  try {
    const response = await axios.post(configData.SERVER_URL + 'students/updateStudentinfo/', data);
  
    console.log(response.data);
    document.getElementById("loader").style.display = "none";
  
    if (response.data.code === 200) {
      this.props.updateToken(response.data.token);
      localStorage.setItem('loginToken', response.data.token);
      window.location.href = "/dashboard";
    } else {
      
      swal({
        title: "Server Error!",
        text: "Please try again",
        icon: "warning",
        button: "ok"
      });
    }
  } catch (error) {
    console.error(error);
    document.getElementById("loader").style.display = "none";
    swal({
      title: "Server Error!",
      text: "Please try again",
      icon: "warning",
      button: "ok"
    });
  }
  
  
    
  }

 
  removeError = (e) => {
    document.getElementById(e.currentTarget.id).style.border = "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
  }


  handlePasswordChange = (event) => {
    event.preventDefault();
    const isValidLength = /^.{8,16}$/;
    if (!isValidLength.test(event.target.value)) {
      this.setState({
          passwordErrorLabel : true,
          passwordErrorMessage :  "Password must be 8-16 Characters Long."
      })
      return
    }
    const isContainsNumber = /^(?=.*[0-9])/;
    if (!isContainsNumber.test(event.target.value)) {
      this.setState({
          passwordErrorLabel : true,
          passwordErrorMessage :  "Password must contain at least one Digit."
      })
      return
    }
    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    if (!isContainsSymbol.test(event.target.value)) {
        this.setState({
            passwordErrorLabel : true,
            passwordErrorMessage :  "Password must contain at least one Special Symbol."
        })
        return
    }
    const isContainsUppercase = /^(?=.*[A-Z])/;
    if (!isContainsUppercase.test(event.target.value)) {
      this.setState({
          passwordErrorLabel : true,
          passwordErrorMessage :  "Password must have at least one Uppercase Character."
      })
      return
    }
    const isContainsLowercase = /^(?=.*[a-z])/;
    if (!isContainsLowercase.test(event.target.value)) {
      this.setState({
          passwordErrorLabel : true,
          passwordErrorMessage :  "Password must have at least one Lowercase Character."
      })
      return
    }
    const isWhitespace = /^(?=.*\s)/;
    if (isWhitespace.test(event.target.value)) {
        this.setState({
            passwordErrorLabel : true,
            passwordErrorMessage :  "Password must not contain Whitespaces."
        })
        return
    }
    this.setState({
        passwordErrorLabel : false,
        passwordErrorMessage :  "",
        [event.target.id] : event.target.value
    });
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
                    <h3>Students Information Form</h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="firstname">
                         <Form.Label>First Name <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="First Name" required="true" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="citizenship">
                         <Form.Label>Citizenship <span className="red"></span></Form.Label>
                          <Form.Control type="text" placeholder="Citizenship"  onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="fieldofstudy">
                          <Form.Label>Field of Study <span className="red"></span></Form.Label>
                          <Form.Control type="text" placeholder="Field of study"  onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                         <Form.Label>Email <span className="red">*</span></Form.Label>
                          <Form.Control type="email" value={this.state.student.email} readOnly onChange={this.handleInputChange}/>
                        </Form.Group>
                      </div>
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="lastname">
                          <Form.Label>Last Name <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="Last Name" required="true" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="dateofbirth">
                          <Form.Label>Date of Birth <span className="red"></span></Form.Label>
                          <Form.Control type="date" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="levelofstudy">
                          <Form.Label>Level of Study <span className="red"></span></Form.Label>
                          <Form.Select onChange={this.handleInputChange}>
                              <option value="0" hidden>Select level of study</option>
                              { this.state.studylevel.map((item,key) => (
                                  <option value={item.levelid}>{item.levelname}</option>
                                ) 
                              )}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone <span className="red"></span></Form.Label>
                          <PhoneInput id="phone" className="form-control" placeholder="Enter phone number" defaultCountry="GB" value={ this.state.phone } onChange={ phone => this.setState({ phone }) } onMouseOut={this.removeError}/>
                        </Form.Group>
                      </div>
                      <div className="col-lg-12 col-md-12 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="password">
                          <Form.Label>Password <span className="red">*</span></Form.Label>
                          <Form.Control type="password" placeholder="*********" required onChange={this.handlePasswordChange}/>
                          {this.state.passwordErrorLabel ? <Form.Label><span className="red"><small>{this.state.passwordErrorMessage}</small></span></Form.Label> : <></> }
                        </Form.Group>
                      </div>
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="university">
                          <Form.Label>School name/ University name<span className="red"></span></Form.Label>
                          <Form.Control type="text" value={this.state.collegename}  readonly="true"/>
                        </Form.Group>
                      </div>
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="city">
                         <Form.Label>City <span className="red"></span></Form.Label>
                         {this.state.gmapsLoaded && (
                            <PlacesAutocomplete 
                              value={this.state.address}
                              onChange={this.handleChange}
                              onSelect={this.handleSelect}
                            >
                              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div>
                                  <input
                                    {...getInputProps({
                                      placeholder: 'Search Places ...',
                                      className: 'location-search-input form-control',
                                      id : 'city',
                                    })}
                                  />
                                  <div className="autocomplete-dropdown-container" id="overlay">
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map(suggestion => {
                                      const className = suggestion.active
                                        ? 'suggestion-item--active'
                                        : 'suggestion-item';
                                      // inline style for demonstration purpose
                                      const style = suggestion.active
                                        ? { backgroundColor: '#fafafa', cursor: 'pointer', padding: '5px' }
                                        : { backgroundColor: '#ffffff', cursor: 'pointer', padding: '5px' };
                                      return (
                                        <div
                                          {...getSuggestionItemProps(suggestion, {
                                            className,
                                            style,
                                          })}
                                        >
                                          <span>{suggestion.description}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </PlacesAutocomplete>
                          )}
                        </Form.Group>
                      </div>

                      <div className="col-lg-12 col-md-12 mt-lg-0 align-left">
                          <Form.Group className="mb-3" controlId="country">
                            <Form.Label>Country <span className="red"></span></Form.Label>
                            <Form.Control type="text" placeholder="Country" readOnly value={this.state.country} onChange={this.handleInputChange}/>
                          </Form.Group>
                      </div>
                    </div>
                  </Card>
                    <div className="btn-wrap-next m-2">
                      <button type="submit" className="btn-buy button-Next" onClick={this.submit}>Submit</button>
                    </div>
                </div>
              </div>
            </div>
          </section>
      </header>
      </div>
      );
    }
}