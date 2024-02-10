import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherGroupDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      groupid: props.match.params.groupid,
      college : "",
      group : "",
      course : "",
      accent : "",
      package : "",
      subscription : "",
      class : "",
      students : []
    }
  }
  componentDidMount () {
    console.log(this.state.groupid)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('groupid', this.state.groupid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'groups/groupdetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
              group : resp.data.group,
              college : resp.data.group.college,
              course : resp.data.group.course,
              accent : resp.data.group.course.accent,
              package : resp.data.group.packages,
              subscription : resp.data.group.subscriptions,
              students : resp.data.group.groupstudents
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
                    <h3>Group Details</h3>
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
                              <td>Course Name</td>
                              <td>{this.state.course.coursename}</td>
                            </tr>
                            <tr>
                              <td>Accent</td>
                              <td>{this.state.accent.accentname}</td>
                            </tr>
                            <tr>
                              <td>Number of Classes</td>
                              <td>{this.state.package.noofclases}</td>
                            </tr>
                            <tr>
                              <td>Duration</td>
                              <td>{this.state.package.timing} Months</td>
                            </tr>
                            <tr>
                              <td>Creation Date</td>
                              <td>{ moment(this.state.group.createdon).format('MMMM Do YYYY')}</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td>
                              {(() => {
                                  switch (this.state.group.status) {
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

                    <h3 className="mt-3">Students Information</h3>
                    <div className="row">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Attended Classes</th>
                              <th>Pending Homework</th>
                              <th>Last Grade</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.students.map((element , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{element.student.firstname}</td>
                              <td>{element.student.lastname}</td>
                              <td>Comming Soon</td>
                              <td>Comming Soon</td>
                              <td>Comming Soon</td>
                              <td>
                                {(() => {
                                  switch (element.student.status) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                              <td><a href={ "/studentdetails/" + element.student.studentid} className="btn-buy">View</a></td>
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