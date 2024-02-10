import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button, Badge} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class StudentAssignments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      student : null
    }
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    console.log(savedToken);
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'assignment/getstudentsassignments',
        headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : savedToken
        },
    }).then(resp => {
        console.log(resp.data)
        document.getElementById("loader").style.display = "none";
        if(resp.data.code === 200){
            this.setState({
                student : resp.data.assignments
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
                    { this.state.student ?
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Assigment Name</th>
                              <th>Course Name</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.student.class.classassignment.map((assignment , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{assignment.assignment_assignmentToclassassignment.name}</td>
                                <td>{assignment.assignment_assignmentToclassassignment.course_assignmentTocourse.coursename}</td>
                                <td>{moment(assignment.duedate).format('MMMM DD, YYYY')}</td>
                                <td>{ new Date(assignment.duedate) < new Date() && assignment.submitedassignments.length < 1  ?
                                        <Badge bg="danger">Over Due</Badge>
                                        :
                                        <>
                                            {assignment.submitedassignments.length < 1 ?  
                                                <Badge bg="primary">Pending</Badge>
                                                :  
                                                <>
                                                    { assignment.submitedassignments[0].status == 0 ?
                                                        <Badge bg="info">Submitted</Badge>
                                                        :
                                                        <Badge bg="success">Completed</Badge>
                                                    }
                                                </>
                                            }
                                        </>
                                    }
                                </td>
                                <td>
                                    {   new Date(assignment.duedate) < new Date() && assignment.submitedassignments.length < 1 ?
                                            <Badge bg="danger">Over Due</Badge>
                                        :
                                        <>
                                            {assignment.submitedassignments.length < 1 ?
                                                        <a href={ "/studentassignmentdetail/" + assignment.assignment_assignmentToclassassignment.id + "/" + assignment.id} className="btn-buy">Open</a>
                                                :
                                                <>
                                                    { assignment.submitedassignments[0].status == 0 ?
                                                        <Badge bg='warning'>Under Review</Badge>
                                                        :
                                                        <a href={ "/studentassignmentdetail/" + assignment.assignment_assignmentToclassassignment.id + "/" + assignment.id} className="btn-buy">View Grades</a>
                                                    }
                                                </>
                                            }
                                        </>
                                    }
                                </td>
                              </tr>
                              ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    :<></>
                    }
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