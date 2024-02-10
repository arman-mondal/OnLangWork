import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class TeacherLiveClassesRecordings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        classid: props.match.params.classid,
        classes : [],
        recordings : [],
        lessonModal : false
    }
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new FormData();
    bodyFormData.append('classid', this.state.classid);
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'classes/getliveclassforcourse/' + this.state.classid,
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


  lessonModalShow = (e) =>{
    console.log(e.currentTarget.id)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('liveclassid', e.currentTarget.id);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'recordings/getTeacherRecordingsforliveclass',
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
              recordings : resp.data.recordings,
              lessonModal : true,
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

  lessonModalHide = (e) =>{
    this.setState({
      lessonModal : false
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
                    <h3>Please Select Your Class to view Recordings</h3>
                    <div className="div-scroll-y">
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
                            {this.state.classes?.map((element ,
                            index) =>(
                              <tr>
                              <td>{index + 1}</td>
                              <td>{element.class.course.coursename}</td>
                              <td>{moment(element.starttime).format('DD/MM/YY')}</td>
                              <td>{moment(element.endtime).format('DD/MM/YY')}</td>
                              <td id={element.liveclassid} onClick={this.lessonModalShow}>view</td>
                              
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                            {/* {this.state.classes.map((element , index) => ( 
                                <div className="col-lg-2 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg">
                                    <a id={element.liveclassid} onClick={this.lessonModalShow} style={{color:"#000"}}>
                                    <i class="fa fa-book fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                                    <label>{element.class.course.coursename} {element.class.course.accent.accentname}</label><br></br>
                                    <label>{element.class.subcriptions.college.collegename}</label><br></br>
                                    <label>{moment(element.starttime).format('DD/MM/YYYY')}</label>
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
          <Modal show={this.state.lessonModal} onHide={this.lessonModalHide} aria-labelledby="contained-modal-title-vcenter" centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Click to view Recordings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="div-scroll-y">
                <div className="row justify-content-md-center">
                  {this.state.recordings.map((element , index) => ( 
                      <div className="col-lg-3 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg text-center">
                          <a id={element + 1} href={ configData.SERVER_URL + element.url } style={{color:"#000"}} target="_blank">
                          <i class="fa fa-camera fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                          <label>{element.title} </label>
                          <label>{moment(element.createdon).format('DD/MM/YY HH:mm A')}</label>
                          </a>
                      </div>
                  ))}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.lessonModalHide}>Close</Button>
            </Modal.Footer>
          </Modal>
      </header>
      </div>
      )
    }
}