import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class Assignments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      courses : [],
      allCourses : [],
      assignments : [],
      classes : [],
      assignmentModal : false,
      assignmentId : null,
      classId : null,
      dueDate : null
    }
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    console.log(savedToken);
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'assignment/getassignments',
        headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : savedToken
        },
    }).then(resp => {
        console.log(resp.data)
        document.getElementById("loader").style.display = "none";
        if(resp.data.code === 200){
            this.setState({
                assignments : resp.data.assignments,
                classes : resp.data.classes
            });
        }else{
            swal({
              title: "Server Not Responding",
              text: "Please reload the page",
              icon: "warning",
              button: "ok",
            });
        }
    }).catch(err => {
        document.getElementById("loader").style.display = "none";
        swal({
          title: "Server Not Responding",
          text: "Please reload the page",
          icon: "warning",
          button: "ok",
        });
    })
  }

  assignAssignmnet = (e) => {
    e.preventDefault()
    console.log(this.state)
    if(this.state.classId == null || this.state.dueDate == null){
      swal({
          title: "Please complete all fields",
          text: "All fields are necessary",
          icon: "warning",
          button: "ok",
        });
    }
    document.getElementById("loader").style.display = "block";
    this.setState({
      assignmentModal : false
    })
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('classId', this.state.classId);
    bodyFormData.append('dueDate', this.state.dueDate);
    bodyFormData.append('assignmentId', this.state.assignmentId);
    axios({
        method: "post",
        url: configData.SERVER_URL + 'assignment/assignassignment',
        data: bodyFormData,
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "authtoken" : localStorage.getItem('loginToken')
            },
    }).then(resp => {
        console.log(resp.data)
        document.getElementById("loader").style.display = "none";
        if(resp.data.code === 200){
            swal({
                title: "Assignment",
                text: "Assignment assigned to selected class successfully",
                icon: "success",
                button: "ok",
            })
        }else{
            swal({
                title: "Server Error!",
                text: "Please try again!",
                icon: "warning",
                button: "ok",
            });
        }
    }).catch(err => {
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
                    <h3>Assigments List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <div className="add-new-course">
                          <Button variant="primary" onClick={() => { window.location = "/createassignment"}}>Create Assignment</Button>
                        </div>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Assigment Name</th>
                              <th>Course Name</th>
                              <th>Created On</th>
                              <th>Assign</th>
                              <th>Edit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.assignments.map((assignment , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{assignment.name}</td>
                                <td>{assignment.course_assignmentTocourse.coursename}</td>
                                <td>{moment(assignment.created_on).format('MMMM DD, YYYY')}</td>
                                <td><a className="btn-buy" style={{backgroundColor: "#198754"}} onClick={() => { this.setState({assignmentModal : true, assignmentId : assignment.id})}}>Assign</a></td>
                                <td><a href={ "/updateassignment/" + assignment.id} className="btn-buy">Edit</a></td>
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

          <Modal show={this.state.assignmentModal} onHide={() => { this.setState({assignmentModal : false})}} aria-labelledby="contained-modal-title-vcenter" centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Assign assignment to class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                  
                  <div className="col-lg-6 col-md-6">
                      <Form.Group className="mb-3" controlId="course">
                          <Form.Label>Select class<span className="red">*</span></Form.Label>
                          <Form.Select onChange={(e) => {
                              this.setState({
                                  classId : e.currentTarget.value
                              })
                          }}>
                              <option value={null}>Select class</option>
                              { this.state.classes.map(myclass =>(
                                  <option value={myclass.classid}>{myclass.course.coursename} {myclass.course.accent.accentname} {myclass.subcriptions.college.collegename} ({myclass.noofstudents} Students)</option>
                              ))}
                          </Form.Select>
                      </Form.Group>
                  </div>
                  <div className="col-lg-6 col-md-6">
                      <Form.Group className="mb-3" controlId="name">
                          <Form.Label>Due Date <span className="red">*</span></Form.Label>
                          <Form.Control type="date" placeholder="Assignment Name" onChange={(e)=>{
                              this.state.dueDate = e.currentTarget.value
                              this.setState({
                                dueDate : this.state.dueDate
                              })
                          }}/>
                      </Form.Group>
                  </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="success" onClick={this.assignAssignmnet}>Save</Button>
              <Button variant="secondary" onClick={() => { this.setState({assignmentModal : false})}}>Close</Button>
            </Modal.Footer>
          </Modal>

      </header>
      </div>
      )
    }
}