import './profiling.css';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from 'react';
import { Form, Card, Badge } from 'react-bootstrap';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import axios from "axios";
import Loader from "react-js-loader";
import swal from "sweetalert";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PlacesAutocomplete, { geocodeByAddress } from "react-places-autocomplete";
import configData from "../config.json";

export default class TeacherSignup extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.match.params.token);
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      password:"",
      phone: "",
      streetno: "",
      streetname: "",
      city: "",
      country: "",
      university: 0,
      accent: 13,
      colleges: [],
      accents: [],
      //DataisLoaded: false,
      //gmapsLoaded: false,
      attachment1: "",
      attachment2: "",
      attachment3: "",
      attachment4: "",
      courses: [],
      selectedCourses: [],
      selectedTopics: []
    };
  }

  componentDidMount() {
    axios({
      method: "get",
      url: configData.SERVER_URL + "college/getall",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authtoken: this.props.match.params.token,
      },
    })
      .then((resp) => {
        console.log(resp.data);
        if (resp.data.code === 200) {
          this.setState({
            colleges: resp.data.colleges,
          });
        } else {
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        swal({
          title: "Server Not Responding",
          text: "Please reload the page",
          icon: "warning",
          button: "ok",
        });
      });
    axios({
      method: "get",
      url: configData.SERVER_URL + "course/getall",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authtoken: this.props.match.params.token,
      },
    })
      .then((resp) => {
        console.log(resp.data);
        if (resp.data.code === 200) {
          this.setState({
            courses: resp.data.courses,
          });
        } else {
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        swal({
          title: "Server Not Responding",
          text: "Please reload the page",
          icon: "warning",
          button: "ok",
        });
      });
    axios({
      method: "get",
      url: configData.SERVER_URL + "accent/getall",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authtoken: this.props.match.params.token,
      },
    })
      .then((resp) => {
        console.log(resp.data);
        if (resp.data.code === 200) {
          console.log(resp.data.code);
          //   let newArr=[]
          //  resp.data.code.accents.map((item)=>{
          //   newArr.push({...item, isSelected:false})
          //   newArr.selected = false
          //  })
          this.setState({
            accents: resp.data.accents,
          });
        } else {
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        swal({
          title: "Server Not Responding",
          text: "Please reload the page",
          icon: "warning",
          button: "ok",
        });
      });
    window.initMap = this.initMap;
    const gmapScriptEl = document.createElement(`script`);
    gmapScriptEl.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbW7sUOtCHtwO_QhbEsp8hjmlDwERkMWE&libraries=places&callback=initMap`;
    document
      .querySelector(`body`)
      .insertAdjacentElement(`beforeend`, gmapScriptEl);
    document.getElementById("loader").style.display = "none";
  }

  initMap = () => {
    this.setState({
      gmapsLoaded: true,
    });
  };

  handleChange = (address) => {
    this.setState({ address });
  };

  handleSelect = (address) => {
    this.setState({ address });
    document.getElementById("city").style.border = "1px solid #ced4da";
    document.getElementById("city").style.boxShadow = "";
    geocodeByAddress(address).then((results) => {
      console.log("Success", results);
      this.setState({
        city: results[0].formatted_address,
      });
      for (var i = 0; i < results[0].address_components.length; i++) {
        var addressType = results[0].address_components[i].types[0];
        if (addressType === "country") {
          this.setState({
            country: results[0].address_components[i].long_name,
          });
        }
      }
    });
  };

  handleInputChange = (e) => {
    e.preventDefault();
    document.getElementById(e.currentTarget.id).style.border =
      "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
    // console.log(e.target.value, "pppppppppppppppppppppppppppp", e.target.id);
    this.setState({
      [e.target.id]: e.target.value,
    });
    };

    handleTopicChange = (selectedTopics) => {
      this.setState({
        selectedTopics: selectedTopics,
      })
    };

  submit = (e) => {
    var flag = true;
    if (
      this.state.attachment1 === "" ||
      typeof this.state.attachment1 === "undefined"
    ) {
      document.getElementById("attachment1").style.borderColor = "red";
      document.getElementById("attachment1").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("attachment1").focus();
      flag = false;
    }
    if (this.state.selectedCourses.length == 0) {
      document.getElementById("prepCheck").style.borderColor = "red";
      document.getElementById("prepCheck").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("prepCheck").focus();
      flag = false;
    }
    if (this.state.accent === 0) {
      document.getElementById("accent").style.borderColor = "red";
      document.getElementById("accent").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("accent").focus();
      flag = false;
    }
    if (
      this.state.country === "" ||
      typeof this.state.country === "undefined"
    ) {
      document.getElementById("country").style.borderColor = "red";
      document.getElementById("country").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("country").focus();
      flag = false;
    }
    if (this.state.city === "" || typeof this.state.city === "undefined") {
      document.getElementById("city").style.borderColor = "red";
      document.getElementById("city").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("city").focus();
      flag = false;
    }
    if (
      this.state.streetname === "" ||
      typeof this.state.streetname === "undefined"
    ) {
      document.getElementById("streetname").style.borderColor = "red";
      document.getElementById("streetname").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("streetname").focus();
      flag = false;
    }
    if (
      this.state.streetno === "" ||
      typeof this.state.streetno === "undefined"
    ) {
      document.getElementById("streetno").style.borderColor = "red";
      document.getElementById("streetno").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("streetno").focus();
      flag = false;
    }
    if (this.state.phone === "" || typeof this.state.phone === "undefined") {
      document.getElementById("phone").style.borderColor = "red";
      document.getElementById("phone").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("phone").focus();
      flag = false;
    }
    if (this.state.email === "" || typeof this.state.email === "undefined") {
      document.getElementById("email").style.borderColor = "red";
      document.getElementById("email").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("email").focus();
      flag = false;
    }
    if (this.state.password === "" || typeof this.state.password === "undefined") {
      document.getElementById("password").style.borderColor = "red";
      document.getElementById("password").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("password").focus();
      flag = false;
    }
    if (
      this.state.lastname === "" ||
      typeof this.state.lastname === "undefined"
    ) {
      document.getElementById("lastname").style.borderColor = "red";
      document.getElementById("lastname").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("lastname").focus();
      flag = false;
    }
    if (
      this.state.firstname === "" ||
      typeof this.state.firstname === "undefined"
    ) {
      document.getElementById("firstname").style.borderColor = "red";
      document.getElementById("firstname").style.boxShadow =
        "2px 3px 3px 7px #FFCCCC";
      document.getElementById("firstname").focus();
      flag = false;
    }
    if (flag) {
      document.getElementById("loader").style.display = "block";
      this.hitRegisterAPI(e);
    }
  };

  hitRegisterAPI(e) {
    var bodyFormData = new FormData();
    bodyFormData.append("firstname", this.state.firstname);
    bodyFormData.append("lastname", this.state.lastname);
    bodyFormData.append("email", this.state.email);
    bodyFormData.append("password", this.state.password);
    bodyFormData.append("phone", this.state.phone);
    bodyFormData.append("streetno", this.state.streetno);
    bodyFormData.append("streetname", this.state.streetname);
    bodyFormData.append("city", this.state.city);
    bodyFormData.append("country", this.state.country);
    bodyFormData.append("university", this.state.university);
    bodyFormData.append("accent", this.state.accent);
    bodyFormData.append("courses", JSON.stringify(this.state.selectedCourses));
    bodyFormData.append("attachment1", this.state.attachment1);
    bodyFormData.append("attachment2", this.state.attachment2);
    bodyFormData.append("attachment3", this.state.attachment3);
    bodyFormData.append("attachment4", this.state.attachment4);
    axios({
      method: "post",
      url: configData.SERVER_URL + "register/teacher",
      data: bodyFormData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((resp) => {
        console.log(resp.data);
        document.getElementById("loader").style.display = "none";
        if(resp &&  1===1){
          swal({
            title: "Thank you",
            text: "We are reviewing your application and we will be in touch shortly",
            icon: "success",
            button: "ok",
          }).then(function () {
            window.location = "/home";
          });
        } else {
          swal({
            title: "Server Error!",
            text: "Please try again!",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        document.getElementById("loader").style.display = "none";
        swal({
          title: "Server Error!",
          text: "Please try again!",
          icon: "warning",
          button: "ok",
        });
      });
  }

  removeError = (e) => {
    document.getElementById(e.currentTarget.id).style.border =
      "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
  };

  onFileChange = (e) => {
    if (e.target.files[0].size > 2000000) {
      swal({
        title: "Upload File Size!",
        text: "File should be less than 2MB!",
        icon: "warning",
        button: "ok",
      });
      e.target.value = "";
      return;
    }
    document.getElementById("attachment1").style.border = "1px solid #ced4da";
    document.getElementById("attachment1").style.boxShadow = "";
    this.setState({
      [e.target.id]: e.target.files[0],
    });
  };

  selectCourse = (course) => {
    document.getElementById("prepCheck").style.border = "1px solid #ced4da";
    document.getElementById("prepCheck").style.boxShadow = "";
    this.setState((prevState) => ({
      selectedCourses: [...prevState.selectedCourses, course],
      courses: this.state.courses.filter(function (preCourse) {
        return preCourse !== course;
      }),
    }));
  };

  removeCourse = (course) => {
    this.setState((prevState) => ({
      courses: [...prevState.courses, course],
      selectedCourses: this.state.selectedCourses.filter(function (
        selectedCourse
      ) {
        return selectedCourse !== course;
      }),
    }));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="loader" id="loader">
            <Loader
              type="spinner-circle"
              bgColor={"#ffffff"}
              title={"LOADING..."}
              color={"#ffffff"}
              size={100}
            />
                </div>

                                    {/*** Form Field Inputs ***/}

          <section className="pricing">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Teacher Information</h3>
                    <div className="row">
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="firstname">
                          <Form.Label>
                            First Name <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="First Name"
                            required
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>
                            Email <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                          <Form.Label>
                            password <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="password"
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="streetno">
                          <Form.Label>
                            Street No<span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            onChange={this.handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="city">
                          <Form.Label>
                            City <span className="red">*</span>
                          </Form.Label>
                          {this.state.gmapsLoaded && (
                            <PlacesAutocomplete
                              value={this.state.address}
                              onChange={this.handleChange}
                              onSelect={this.handleSelect}
                            >
                              {({
                                getInputProps,
                                suggestions,
                                getSuggestionItemProps,
                                loading,
                              }) => (
                                <div>
                                  <input
                                    {...getInputProps({
                                      placeholder: "Search Places ...",
                                      className:
                                        "location-search-input form-control",
                                      id: "city",
                                    })}
                                  />
                                  <div
                                    className="autocomplete-dropdown-container"
                                    id="overlay"
                                  >
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map((suggestion) => {
                                      const className = suggestion.active
                                        ? "suggestion-item--active"
                                        : "suggestion-item";
                                      // inline style for demonstration purpose
                                      const style = suggestion.active
                                        ? {
                                            backgroundColor: "#fafafa",
                                            cursor: "pointer",
                                            padding: "5px",
                                          }
                                        : {
                                            backgroundColor: "#ffffff",
                                            cursor: "pointer",
                                            padding: "5px",
                                          };
                                      return (
                                        <div
                                          {...getSuggestionItemProps(
                                            suggestion,
                                            {
                                              className,
                                              style,
                                            }
                                          )}
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

                                    {/* Accent Selection */}

                     
                        {/* <Form.Group className="mb-3" controlId="university">
                          <Form.Label>Are you teaching in any of the following institution? <span className="red">*</span></Form.Label>
                          <Form.Select aria-label="School name/ University name" onChange={this.handleInputChange}>
                            <option value="0">No</option>
                            {this.state.colleges.map((item) => ( 
                              <option value={item.collegeid}>{item.collegename}</option>
                              ))}
                          </Form.Select>
                        </Form.Group> */}
                      </div>
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 align-left">
                        <Form.Group className="mb-3" controlId="lastname">
                          <Form.Label>
                            Last Name <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Last Name"
                            required
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Phone <span className="red">*</span>
                          </Form.Label>
                          <PhoneInput
                            id="phone"
                            className="form-control"
                            placeholder="Enter phone number"
                            defaultCountry="GB"
                            value={this.state.phone}
                            onChange={(phone) => this.setState({ phone })}
                            onMouseOut={this.removeError}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="streetname">
                          <Form.Label>
                            Street Name <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            required
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="country">
                          <Form.Label>
                            Country <span className="red">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Country"
                            value={this.state.country}
                            onChange={this.handleInputChange}
                          />
                        </Form.Group>
                        {/* <Form.Group className="mb-3" controlId="accent">
                          <Form.Label>Please select your accent <span className="red">*</span></Form.Label>
                          <Form.Select aria-label="Please select accent" onChange={this.handleInputChange}>
                            <option value="0" selected hidden >Select Accent</option>
                            {this.state.accents.map((item) => ( 
                              <option value={item.accentid}>{item.accentname} Accent</option>
                              ))}
                          </Form.Select>
                        </Form.Group> */}
                      </div>
                    </div>

                                    {/* Topic Selection */}

                    <div>
                        <h5 className="text-center mb-4">
                            Please choose the topics you can teach<span className="red">*</span>
                        </h5>
                        <ToggleButtonGroup
                            type="radio"
                            name="topics"
                            className="topic-button-container"
                            value={this.state.selectedTopic}
                            onChange={this.handleTopicChange}
                        >
                            <ToggleButton id="tbg-btn-1" value="AI" className="topic-button">
                                AI
                            </ToggleButton>
                            <ToggleButton id="tbg-btn-2" value="TOEFL" className="topic-button">
                                TOEFL
                            </ToggleButton>
                            <ToggleButton id="tbg-btn-3" value="IELTS" className="topic-button">
                                IELTS
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>


                                    {/* Course Selection */}

                    <div
                      id="prepCheck"
                      className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center mb-4">Please select the course you can teach for (more than one choice possible)<span className="red">*</span></h5>
                      <div className="col-lg-5 col-md-5 mb-3">
                        <ul className="list-group">
                          <li className="list-group-item selectliHead">
                            <strong>Available Courses</strong>
                          </li>
                        </ul>
                        <ul className="list-group selectbox">
                          {this.state.selectedCourses.map((selectedCourse) => (
                            <li
                              className="list-group-item list-group-item-secondary"
                              onClick={(e) => this.removeCourse(selectedCourse)}
                            >
                              <div className="selectInnerDiv">
                                <div className="studentInfo">
                                  {selectedCourse.coursename}                                 </div>
                                <div className="badgeInfo">
                                  <Badge bg="light">
                                    <i
                                      className="fa fa-check fa-2xs"
                                      aria-hidden="true"
                                    ></i>
                                  </Badge>
                                </div>
                              </div>
                            </li>
                          ))}
                          {this.state.courses
                            .filter(
                              (mycourse) =>
                                mycourse.accent.accentid == this.state.accent && mycourse.description!=='created by user'
                            )
                            .filter(course=>course.coursename===this.state.selectedTopics)
                            .length > 0 ? (
                              <>
                                {this.state.courses
                                  .filter(
                                    (mycourse) =>
                                      mycourse.accent.accentid == this.state.accent && mycourse.description!=='created by user'
                                  )
                                  .filter(course=>course.coursename===this.state.selectedTopics)
                                  .map((course) => (
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      onClick={(e) => this.selectCourse(course)}
                                    >
                                      <div className="selectInnerDiv">
                                        <div className="studentInfo">
                                          {course.coursename} 
                                        </div>
                                        <div className="badgeInfo">
                                          <Badge bg="light">
                                            <i
                                              className="fa fa-check fa-2xs text-light"
                                              aria-hidden="true"
                                            ></i>
                                          </Badge>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                              </>
                            ) :  <li
                            className="list-group-item list-group-item-secondary"
                          >
                            <div className="selectInnerDiv">
                              <div className="studentInfo">
                                No Course Available
                              </div>
                            
                            </div>
                          </li>}
                             
                        </ul>
                      </div>
                      <div className="col-lg-1 col-md-1 d-flex align-items-center justify-content-center">
                        <i
                          className="fas fa-caret-right fa-2x"
                          aria-hidden="true"
                        ></i>
                      </div>
                      <div className="col-lg-5 col-md-5 mb-3">
                        <ul className="list-group">
                          <li className="list-group-item selectliHead">
                            <strong>Selected Courses</strong>
                          </li>
                        </ul>
                        <ul className="list-group selectbox">
                          {this.state.selectedCourses.map((selectedCourse) => (
                            <li
                              className="list-group-item list-group-item-secondary"
                              onClick={(e) => this.removeCourse(selectedCourse)}
                            >
                              {selectedCourse.coursename}                             </li>
                          ))}
                        </ul>
                      </div>
                     </div>

                                    {/*** Teaching Certificate ***/}

                    <div className="col-lg-12 col-md-12 mt-6 mt-lg-0 align-left">
                      <Form.Group className="mb-3" controlId="attachment1">
                        <Form.Label>
                          Please provide your teaching certificate
                          attachment<span className="red">*</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          required
                          onChange={this.onFileChange}
                          accept=".pdf, .jpg, .jpeg"
                        />
                      </Form.Group>
                    </div>
                  </Card>
                  <div className="btn-wrap-next m-2">
                    <a href="/teacherSignup" className="btn-buy button-Next">
                      Clear
                    </a>
                    <button
                      type="submit"
                      className="btn-buy button-Next"
                      onClick={this.submit}
                    >
                      Register
                    </button>
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
