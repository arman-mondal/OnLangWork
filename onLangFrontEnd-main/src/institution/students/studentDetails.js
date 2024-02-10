import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class StudentDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      student : "",
      studylevel : "",
      studentid: props.match.params.studentid,
      classes : [],
      scheduleModal : false,
      schedule : [],
    }
  }
  componentDidMount () {
    this.getStudentDetails()
  }

  scheduleModalShow = (e) =>{
    this.setState({
      scheduleModal : true
    })
  }
  schedulModalHide = (e) =>{
    this.setState({
      scheduleModal : false
    })
  }

  getStudentDetails(){
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('studentid', this.state.studentid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'students/getinstitutionstudentdetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            var schedule = []
            resp.data.student.classstudents.forEach(element => {
                schedule = [...schedule , ...element.class.classtiming]
            })
            this.setState({
              student : resp.data.student,
              classes : resp.data.student.classstudents,
              studylevel : resp.data.student.studylevel,
              schedule : schedule
            });
          }else{
            if(resp.data.code == 201){
              swal({
                title: "Login Expired!",
                text: "Please login again",
                icon: "warning",
                button: "ok",
              });
            }else{
              swal({
                title: "Invalid Access!",
                text: "You don't have access to view the details of this student.",
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
          text: "Please try again",
          icon: "warning",
          button: "ok",
        });
    })
  }

  updateStudentStatus = (e) => {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('studentid', this.state.studentid);
    if(e.currentTarget.id == "active"){
      bodyFormData.append('status', 0);
    }else{
      bodyFormData.append('status', 2);
    }
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'students/updateStudentStatus',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.getStudentDetails()
            swal({
              title: "Access",
              text: "Student access has been successfully updated",
              icon: "success",
              button: "ok",
            })
          }else{
            if(resp.data.code == 201){
              swal({
                title: "Login Expired!",
                text: "Please login again",
                icon: "warning",
                button: "ok",
              });
            }else{
              swal({
                title: "Invalid Access!",
                text: "You don't have access to view the details of this student.",
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
                    <h3>Student Details</h3>
                    <div className="row">
                      <div className="col-lg-4 col-md-4 mt-12 mt-lg-0">
                        <img className="round" src={ configData.SERVER_URL_ASSETS + this.state.student.image} width="50%"/>
                        <br/>
                        <Form.Group>
                          <Form.Label>
                            <strong>
                              { this.state.student.firstname} { this.state.student.lastname}
                            </strong>
                            <br/>
                            { this.state.student.email} 
                            <br/>
                            { this.state.student.phone} 
                            <br/>
                            { this.state.student.city} 
                          </Form.Label>
                        </Form.Group>
                        {this.state.student.status == 0 ? 
                          <a id="restrict" onClick={this.updateStudentStatus} className="btn-buy m-3">Restrict</a> : 
                          <a id="active" onClick={this.updateStudentStatus} className="btn-buy m-3">Active</a> 
                        }
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <div className="mb-3">
                          <a href="#" className="btn-buy m-3">View Analytics</a>
                          <a onClick={this.scheduleModalShow} className="btn-buy m-3">View Schedule</a>
                        </div>
                        <Table striped bordered hover>
                          <tbody>
                            <tr>
                              <td>Date of Birth</td>
                              <td>{this.state.student.dateofbirth}</td>
                            </tr>
                            <tr>
                              <td>Citizenship</td>
                              <td>{this.state.student.citizenship}</td>
                            </tr>
                            <tr>
                              <td>Level of Study</td>
                              <td>{this.state.studylevel.levelname}</td>
                            </tr>
                            <tr>
                              <td>Registered On</td>
                              <td>{ moment(this.state.student.registeron).format('DD/MM/YYYY')}</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td>
                              {(() => {
                                  switch (this.state.student.status) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <h3 className="mt-3">Current Classes</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Course Name</th>
                              <th>Accent</th>
                              <th>No of Classes</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Remaining Classes</th>
                              <th>View</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.classes.map((element , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{element.class.subcriptions.packages.course.coursename}</td>
                                <td>{element.class.subcriptions.packages.course.accent.accentname}</td>
                                <td>{element.class.subcriptions.packages.noofclases}</td>
                                <td>{moment(element.class.startdate).format('DD/MM/YY')}</td>
                                <td>{moment(element.class.endate).format('DD/MM/YY')}</td>
                                <td>{element.class.remainingclasses}</td>
                                <td><a href={ "/classdetails/" + element.class.classid} className="btn-buy">View</a></td>
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
          <Modal show={this.state.scheduleModal} onHide={this.schedulModalHide} aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
              <Modal.Title>Schedule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="row">
                  <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                    <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Day</th>
                            <th>Slot Name</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.schedule.map((element , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{element.days.day}</td>
                              <td>{element.slots.name}</td>
                              <td>{ moment(element.slots.starttime).format('HH:mm:ss A')}</td>
                              <td>{ moment(element.slots.endtime).format('HH:mm:ss A')}</td>
                            </tr>
                            ))}
                        </tbody>
                      </Table>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.schedulModalHide}>Close</Button>
            </Modal.Footer>
          </Modal>
      </header>
      </div>
      )
    }
}