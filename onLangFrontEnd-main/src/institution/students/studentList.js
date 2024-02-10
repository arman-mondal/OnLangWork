import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class StudentList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      students : []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'students/getInstitutionStudentList',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            students : resp.data.students
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
                    <h3>Student List</h3>
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