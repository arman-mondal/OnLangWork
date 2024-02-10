import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class SubscritionDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      subscription : "",
      package : "",
      course : "",
      accent : "",
      students : [],
      college : "",
      class : [],
      subscriptionid: props.match.params.subscriptionid,
      dataisLoaded : false
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('subscriptionid', this.state.subscriptionid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'subscription/getsubscriptiondetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            subscription : resp.data.subcription,
            class : resp.data.subcription.class,
            packages : resp.data.subcription.packages,
            course : resp.data.subcription.packages.course,
            accent : resp.data.subcription.packages.course.accent,
            students : resp.data.subcription.student,
            college : resp.data.subcription.college,
            dataisLoaded : true
          });
          document.getElementById("loader").style.display = "none";
        })
      .catch(err => {
        document.getElementById("loader").style.display = "none";
        console.log(err)
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
                    <h3>Subscription Details</h3>
                    <div className="row">
                      <div className="col-lg-4 col-md-4 mt-12 mt-lg-0">
                        <img className="round" src={ configData.SERVER_URL_ASSETS + this.state.college.collegelogo} width="50%"/>
                        <br/>
                        <Form.Group>
                          <Form.Label>
                            <strong>
                              { this.state.college.collegename}
                            </strong>
                            <br/>
                              { this.state.college.email}
                            <br/>
                              { this.state.college.phone}
                            <br/>
                              { this.state.college.city}
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <tbody>
                            <tr>
                              <td>Course</td>
                              <td>{this.state.course.coursename}</td>
                            </tr>
                            <tr>
                              <td>Accent</td>
                              <td>{this.state.accent.accentname}</td>
                            </tr>
                            <tr>
                              <td>Used Slots</td>
                              <td>{this.state.subscription.usedslots} Slots</td>
                            </tr>
                            <tr>
                              <td>Subscribed On</td>
                              <td>{ moment(this.state.subscription.subscriptiondate).format('DD/MM/YYYY')}</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td>
                              {(() => {
                                  switch (this.state.subscription.optionmenu) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                            </tr>
                            <tr>
                              <td>Start Date</td>
                              <td>{ this.state.class.length > 0 ? moment(this.state.class[0].startdate).format('DD/MM/YYYY') : "Start Soon"}</td>
                            </tr>
                            <tr>
                              <td>Expiry Date</td>
                              <td>{ this.state.class.length > 0 ? moment(this.state.class[0].endate).format('DD/MM/YYYY') : "Start Soon"}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <h3 className="mt-3">Students</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Registered On</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.students.map((student , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{student.firstname}</td>
                                <td>{student.lastname}</td>
                                <td>{student.email}</td>
                                <td>{student.phone}</td>
                                <td>{ moment(student.registeron).format('DD/MM/YYYY')}</td>
                                <td>
                                  {(() => {
                                    switch (student.status) {
                                      case 0: return "Active";
                                      case 1: return "Pending Approval";
                                      case 2: return "Archived";
                                      default: return "Pending Approval";
                                    }
                                  })()}
                                </td>
                                <td><a href={ "/studentdetails/" + student.studentid} className="btn-buy">View</a></td>
                              </tr>
                              ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
      </header>
      </div>
      )
    }
}