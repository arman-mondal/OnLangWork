import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      teacher : "",
      teacherid: props.match.params.teacherId,
      teachercourses: [],
      classes : []
    }
  }
  componentDidMount () {
    console.log(this.state.teacherid)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('teacherid', this.state.teacherid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'teachers/getinstitutionteacherdetails',        
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            teacher : resp.data.teachers,
            teachercourses : resp.data.teachers.teachercourses,
            classes : resp.data.teachers.class,
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
                    <h3>Teacher Details</h3>
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
                        <a href="#" className="btn-buy m-3">Restrict</a>
                      </div>
                      <div className="col-lg-8 col-md-8 mt-12 mt-lg-0">
                        <div className="mb-3">
                          <a href="#" className="btn-buy m-3">View History</a>
                          <a href="#" className="btn-buy m-3">View Schedule</a>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Course Name</th>
                              <th>Accent</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.teachercourses.map((course , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{course.course.coursename}</td>
                                <td>{course.course.accent.accentname}</td>
                                <td>
                                {(() => {
                                  switch (course.status) {
                                    case 0: return "Active";
                                    case 1: return "Archived";
                                    default: return "Active";
                                  }
                                })()}
                              </td>
                              </tr>
                            ))}
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
                                <td>{element.subcriptions.packages.course.coursename}</td>
                                <td>{element.subcriptions.packages.course.accent.accentname}</td>
                                <td>{element.subcriptions.packages.noofclases}</td>
                                <td>{moment(element.startdate).format('DD/MM/YY, h:mm:ssA')}</td>
                                <td>{moment(element.endate).format('DD/MM/YY, h:mm:ssA')}</td>
                                <td>{element.remainingclasses}</td>
                                <td><a href={ "/classdetails/" + element.classid} className="btn-buy">View</a></td>
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