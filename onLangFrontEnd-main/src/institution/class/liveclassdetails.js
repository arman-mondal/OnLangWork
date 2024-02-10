import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class LiveClassDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      teacher : "",
      students : [],
      liveclass : "",
      classid: props.match.params.liveclassid,
    }
  }
  componentDidMount () {
    console.log(this.state.classid)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('classid', this.state.classid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'classes/getlivecalssdetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
          	teacher : resp.data.classes.teacher,
          	students : resp.data.classes.liveclassstudents,
          	liveclass : resp.data.classes,
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
          <section className="pricing div-scroll-y-panel">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Live Class Details</h3>
                    <div className="row">
                      <div className="col-lg-4 col-md-4 mt-12 mt-lg-0">
                        <img className="round" src={ configData.SERVER_URL_ASSETS + this.state.teacher.image} width="50%"/>
                        <br/>
                        <Form.Group>
                          <Form.Label>
                            <strong>
                              { this.state.teacher.firstname} { this.state.teacher.lastname}
                            </strong>
                            <br/>
                            { this.state.teacher.email} 
                            <br/>
                            { this.state.teacher.phone} 
                            <br/>
                            { this.state.teacher.street}, { this.state.teacher.address} 
                            <br/>
                            { this.state.teacher.city}
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <tbody>
                            <tr>
                              <td>Live Class Id</td>
                              <td>{this.state.liveclass.uuid}</td>
                            </tr>
                            <tr>
                              <td>Start Time</td>
                              <td>{ moment(this.state.liveclass.starttime).format('DD/MM/YY, h:mm:ss A')}</td>
                            </tr>
                            <tr>
                              <td>End Time</td>
                              <td>{ moment(this.state.liveclass.endtime).format('DD/MM/YY, h:mm:ss A')}</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td>
                                {(() => {
                                  switch (this.state.liveclass.status) {
                                    case 0: return "Live";
                                    case 1: return "Completed";
                                    case 2: return "Archived";
                                    default: return "Live";
                                  }
                                })()}
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <h3 className="mt-3">Live Class Students</h3>
                    <div className="row div-scroll-y-invite">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Class Join Time</th>
                              <th>Class Leaving Time</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                          {this.state.students.map((student , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{student.student.firstname}</td>
                              <td>{student.student.lastname}</td>
                              <td>{student.student.email}</td>
                              <td>{student.student.phone}</td>
                              <td>{ moment(student.starttime).format('DD/MM/YYYY, h:mm:ss A')}</td>
                              <td>{ moment(student.endtime).format('DD/MM/YYYY, h:mm:ss A')}</td>
                              <td><a href={ "/studentdetails/" + student.student.studentid} className="btn-buy">View</a></td>
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