import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherCoursesList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      courses : [],
      allCourses : [],
      addNewCourseModal : false,
    }
  }

  addNewCourseModalShow = (e) =>{
    this.setState({
      addNewCourseModal : true
    })
  }
  addNewCourseModalHide = (e) =>{
    this.setState({
      addNewCourseModal : false
    })
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'course/getteachercourses',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)

          if(resp.data.code == 200){
            this.setState({
              courses : resp.data.teacherCourses,
              allCourses : resp.data.courses
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


  addNewCourse = (e) => {
    console.log(e.target.id)
    document.getElementById("loader").style.display = "block"
    var bodyFormData = new URLSearchParams()
    bodyFormData.append('courseid', e.target.id)
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'course/addnewteachercourse',
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
              courses : resp.data.teacherCourses,
              allCourses : resp.data.courses
            });
            swal({
              title: "New Course Added!",
              text: "New course has been added to your list successfully",
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
                    <h3>Courses List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <div className="add-new-course">
                          <Button variant="primary" onClick={this.addNewCourseModalShow}>Add New Course</Button>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Course Name</th>
                              <th>Accent Name</th>
                              <th>Description</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.courses.map((course , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{course.course.coursename}</td>
                                <td>{course.course.accent.accentname}</td>
                                <td>{course.course.description}</td>
                                <td><a href={ "/coursedetails/" + course.course.courseid} className="btn-buy">View</a></td>
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

          <Modal show={this.state.addNewCourseModal} onHide={this.addNewCourseModalHide} aria-labelledby="contained-modal-title-vcenter" centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Add to Teaching list</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                  <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Course Name</th>
                          <th>Accent Name</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.allCourses.map((course , index) => ( 
                          <tr>
                            <td>{index + 1}</td>
                            <td>{course.coursename}</td>
                            <td>{course.accent.accentname}</td>
                            <td><Button id={course.courseid} variant="warning" onClick={this.addNewCourse} >Add</Button></td>
                          </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.addNewCourseModalHide}>Close</Button>
            </Modal.Footer>
          </Modal>
      </header>
      </div>
      )
    }
}