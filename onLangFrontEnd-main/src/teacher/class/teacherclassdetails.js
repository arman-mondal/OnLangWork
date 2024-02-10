import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherClassDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      teacher : "",
      course : "",
      accent : "",
      package : "",
      subcription : "",
      students : [],
      class : "",
      liveclass : [],
      classtiming : [],
      classid: props.match.params.classid,
      slotsModal : false,
      liveclassModal : false
    }
  }
  componentDidMount () {
    console.log(this.state.classid)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('classid', this.state.classid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'classes/getcalssdetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
            	teacher : resp.data.classes.teacher,
            	course : resp.data.classes.course,
            	accent : resp.data.classes.course.accent,
            	package : resp.data.classes.packages,
            	subcription : resp.data.classes.subcriptions,
            	students : resp.data.classes.classstudents,
            	class : resp.data.classes,
            	liveclass : resp.data.classes.liveclass,
              classtiming : resp.data.classes.classtiming
            });
          }else{
            if(resp.data.code == 201){
              swal({
                title: "Login Expired!",
                text: "Please Login again!",
                icon: "warning",
                button: "ok",
              });
            }else{
              swal({
                title: "Invalid Access!",
                text: "You dont have access to view details for requested class.",
                icon: "warning",
                button: "ok",
              });
            }
          }
          document.getElementById("loader").style.display = "none";
        })
      .catch(err => {
        document.getElementById("loader").style.display = "none";
        console.log(err)
        swal({
          title: "Server Error!",
          text: "Please try again!",
          icon: "warning",
          button: "ok",
        });
    })
  }

  slotsModalShow = (e) =>{
    console.log("Jawad")
    this.setState({
      slotsModal : true
    })
  }
  slotsModalHide = (e) =>{
    this.setState({
      slotsModal : false
    })
  }

  liveclassModalShow = (e) =>{
    console.log("Jawad")
    this.setState({
      liveclassModal : true
    })
  }
  liveclassModalHide = (e) =>{
    this.setState({
      liveclassModal : false
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
                    <h3>Class Details</h3>
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
                              <td>Course</td>
                              <td>{this.state.course.coursename}</td>
                            </tr>
                            <tr>
                              <td>Accent Required</td>
                              <td>{this.state.accent.accentname}</td>
                            </tr>
                            <tr>
                              <td>No of students</td>
                              <td>{this.state.package.noofstudent} Students</td>
                            </tr>
                            <tr>
                              <td>No of classes</td>
                              <td>{this.state.package.noofclases} Classes</td>
                            </tr>
                            <tr>
                              <td>Remaining Classes</td>
                              <td>{this.state.class.remainingclasses}</td>
                            </tr>
                            <tr>
                              <td>Schedule</td>
                              <td><a className="btn-buy" onClick={this.slotsModalShow}>View Schedule</a></td>
                            </tr>
                            <tr>
                              <td>Past Classes</td>
                              <td><a className="btn-buy" onClick={this.liveclassModalShow}>View History</a></td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <h3 className="mt-3">Current Students</h3>
                    <div className="row div-scroll-y-invite">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Missed Classes</th>
                              <th>Pending Homework</th>
                              <th>Grades</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                          {this.state.students.map((student , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{student.student.firstname}</td>
                              <td>{student.student.lastname}</td>
                              <td>Comming Soon</td>
                              <td>Comming Soon</td>
                              <td>Comming Soon</td>
                              <td>
                                {(() => {
                                  switch (student.student.status) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
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

          <Modal show={this.state.slotsModal} onHide={this.slotsModalHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title>Class Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row div-scroll-y-invite">
                <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Day</th>
                        <th>Slot</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                    {this.state.classtiming.map((timing , index) => ( 
                      <tr>
                        <td>{index + 1}</td>
                        <td>{timing.days.day}</td>
                        <td>{timing.slots.name}</td>
                        <td>{ moment(timing.slots.starttime).format('h:mm:ss A')}</td>
                        <td>{ moment(timing.slots.endtime).format('h:mm:ss A')}</td>
                      </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.slotsModalHide}>Close</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={this.state.liveclassModal} onHide={this.liveclassModalHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title>History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row div-scroll-y-invite">
                <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Teacher Name</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                    {this.state.liveclass.map((myClass , index) => ( 
                      <tr>
                        <td>{index + 1}</td>
                        <td>{myClass.teacher.firstname} {myClass.teacher.lastname}</td>
                        <td>{ moment(myClass.starttime).format('h:mm:ss A')}</td>
                        <td>{ moment(myClass.endtime).format('h:mm:ss A')}</td>
                        <td>
                          {(() => {
                            switch (myClass.status) {
                              case 0: return "Live";
                              case 1: return "Completed";
                              case 2: return "Archived";
                              default: return "Live";
                            }
                          })()}
                        </td>
                        <td><Button variant="secondary" href={ "/liveclassdetails/" + myClass.liveclassid}>View</Button></td>
                      </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.liveclassModalHide}>Close</Button>
            </Modal.Footer>
          </Modal>

      </header>
      </div>
      )
    }
}