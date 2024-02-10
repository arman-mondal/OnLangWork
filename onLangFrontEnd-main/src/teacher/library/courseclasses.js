import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherClassesRecordings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        courseid: props.match.params.courseid,
        classes : [],
    }
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'classes/getclassforcourse/' + this.state.courseid,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)

          if(resp.data.code == 200){
            this.setState({
              classes : resp.data.classes,
            });
          }else{
            if(resp.data.code == 201){
              swal({
                title: "Login Expired!",
                text: "Please Login again",
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
                    <h3>Please Select Your Class to view Recordings for {this.state.classes.length > 0 ? this.state.classes[0].course.coursename : null}</h3>
                    <div className="row div-scroll-y">
                        <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        <Table striped bordered hover>
                        <thead>
                          <tr>
                          <th>#</th>
                              <th>Name</th>
                              <th>Start Time</th>
                              <th>End Time</th>
                              <th>View</th>
                          </tr>
                        </thead>
                       
                        <tbody>
                            {this.state.classes?.map((element , index) => ( 
                              <tr>
                                <td>{index + 1}</td>
                                <td>{element.course.coursename}</td>
                                <td>{moment(element.startdate).format('DD/MM/YY')}</td>
                                <td>{moment(element.endate).format('DD/MM/YY')}</td>
                                <td><a href={ '/teacherclassesliverecordings/'+element.classid} className="btn-buy">View</a></td>
                              </tr>
                              ))}
                         
                        </tbody>

                        </Table>
                            {/* {this.state.classes.map((element , index) => ( 
                                <div className="col-lg-2 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg">
                                    <a id={element + 1} href={ '/teacherclassesliverecordings/'+element.classid } style={{color:"#000"}}>
                                    <i class="fa fa-book fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                                    <label>{element.course.coursename} {element.course.accent.accentname} Accent</label><br></br>
                                    <label>{element.subcriptions.college.collegename} {element.subcriptions.college.collegetype}</label><br></br>
                                    <label>{moment(element.startdate).format('DD/MM/YY')} {moment(element.endate).format('DD/MM/YY')}</label>
                                    </a>
                                </div>
                            ))} */}
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