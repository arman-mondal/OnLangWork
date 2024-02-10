import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class CourseDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      courseid: props.match.params.courseid,
      classes : [],
      course : "",
      accent : "",
      teacher : ""
    }
  }
  componentDidMount () {
    console.log(this.state.courseid)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('courseid', this.state.courseid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'course/teachercoursedetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
              classes : resp.data.classes,
              course : resp.data.classes[0].course,
              accent : resp.data.classes[0].course.accent,
              teacher : resp.data.classes[0].teacher
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
                    <h3>Course Details</h3>
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
                            { this.state.teacher.city} 
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <tbody>
                            <tr>
                              <td>Course Name</td>
                              <td>{this.state.course.coursename}</td>
                            </tr>
                            <tr>
                              <td>Accent</td>
                              <td>{this.state.accent.accentname}</td>
                            </tr>
                            <tr>
                              <td>Unpaid Teaching Hours</td>
                              <td>Coming Soon</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td>
                              {(() => {
                                  switch (this.state.course.status) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                            </tr>
                            <tr>
                              <td>Lesson Plans</td>
                              <td><a href={ "/lessonplan/" + this.state.course.courseid } className="btn-buy">View Details</a></td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <h3 className="mt-3">Class Information</h3>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Institution</th>
                              <th>Classes Start Date</th>
                              <th>Classes End Date</th>
                              <th>Remaining Classes</th>
                              <th>No of Students</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.classes.map((element , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>
                                  {element.classgroups.map((classgroup) => (
                                    <p>{classgroup.groups.subcriptions.college.collegename}</p>
                                  ))}
                                </td>
                                <td>{ moment(element.startdate).format('DD/MM/YYYY')}</td>
                                <td>{ moment(element.endate).format('DD/MM/YYYY')}</td>
                                <td>{element.remainingclasses}</td>
                                <td>{element.classstudents.length}</td>
                                <td>
                                  {(() => {
                                    switch (element.classstatus) {
                                      case 0: return "Active";
                                      case 1: return "Pending Approval";
                                      case 2: return "Archived";
                                      default: return "Pending Approval";
                                    }
                                  })()}
                                </td>
                                <td><a href={ "/teacherclassdetails/" + element.classid} className="btn-buy">View</a></td>
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