import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherAvaliableClasses extends React.Component {

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
        url:  configData.SERVER_URL + 'groups/avaliablegroups',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          this.setState({
            classes : resp.data.filteredgroups
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

  acceptRejectClass = (groupId) => (e) => {
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('groupid', groupId);
    axios({
      method: "post",
      url:  configData.SERVER_URL + 'groups/acceptgroupbyteacher',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : localStorage.getItem('loginToken')
      },
    }).then(resp => {
        if(resp.data.code === 200){
          swal({
            title: "Group Accepted",
            text: "Success",
            icon: "success",
            button: "ok",
          }).then(() =>{
            window.location = '/teacherclasslist';
          });
        }else{
          if(resp.data.code === 201){
            swal({
              title: "Login",
              text: "Session expired please login again",
              icon: "warning",
              button: "ok",
            });
          }
          else{
            swal({
              title: "We're Sorry!",
              text: resp.data.message,
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
                    <h3>Avaliable Classes</h3>
                    <div className="row div-scroll-y">
                        {this.state.classes.map((myclass , index) => (
                            <div className="col-lg-4 col-md-4 mt-6 mt-lg-0">
                                <div class="card shadow mb-3">
                                    <div class="card-header bg-transparent">{myclass.groupname} ({myclass.course.accent.accentname})</div>
                                    <div class="card-body">
                                        <h6 class="card-title">{myclass.subcriptions.college.collegename}</h6>
                                        <p class="card-text"><strong>No Of Students:</strong>&nbsp;&nbsp;{myclass.groupstudents.length}</p>
                                        
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Day</th>
                                                    <th>Start Time</th>
                                                    <th>End Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                              { myclass.grouptimings.map( (slot , index) => (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{slot.days.day}</td>
                                                    <td>{moment(slot.slots.starttime).format("HH:mm:ss")}</td>
                                                    <td>{moment(slot.slots.endtime).format("HH:mm:ss")}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div class="card-footer">
                                        <a onClick={this.acceptRejectClass(myclass.groupid)} className="btn-buy m-1">Accept</a>
                                    </div>
                                </div>
                            </div>
                        ))}
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