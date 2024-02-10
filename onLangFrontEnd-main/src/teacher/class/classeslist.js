import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherClassList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      classes : []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'classes/getteacherclasseslist',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          this.setState({
            classes : resp.data.classes
          });
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

  acceptRejectClass = (status,classId) => (e) => {
    console.log("Jawad")
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('status', status);
    bodyFormData.append('classid', classId);
    axios({
      method: "post",
      url:  configData.SERVER_URL + 'classes/acceptrejectclass',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(resp => {
        if(resp.data.code === 200){
          this.setState({
            classes : resp.data.classes
          });
        }else{
          if(resp.data.code === 201){
            swal({
              title: "Login",
              text: "Session expired please login again",
              icon: "success",
              button: "ok",
            });
          }
          else{
            swal({
              title: "Server Not Responding",
              text: "Please reload the page",
              icon: "warning",
              button: "ok",
            });
          }
        }
      })
    .catch(err => {
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
                    <h3>Classes List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Course Name</th>
                            <th>Accent Name</th>
                            <th>No of students</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Remaining Classes</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.classes.map((myclass , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{myclass.course.coursename}</td>
                              <td>{myclass.course.accent.accentname}</td>
                              <td>{myclass.noofstudents}</td>
                              <td>{ moment(myclass.startdate).format('DD/MM/YYYY')}</td>
                              <td>{ moment(myclass.endate).format('DD/MM/YYYY')}</td>
                              <td>{myclass.remainingclasses}</td>
                              <td>
                                { myclass.classstatus == 0 ? 
                                  <a href={ "/teacherclassdetails/" + myclass.classid} className="btn-buy">View</a>
                                  :
                                  myclass.classstatus == 1 ?
                                      <div>
                                        <a onClick={this.acceptRejectClass(0,myclass.classid)} className="btn-buy">Accept</a>
                                        <a onClick={this.acceptRejectClass(2,myclass.classid)} className="btn-buy">Reject</a>
                                      </div>
                                    :
                                      <a className="btn-buy">Rejected</a>
                                }
                              </td>
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