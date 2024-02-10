import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Alert, Table, Modal, Button} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Dropzone from 'react-dropzone';

export default class StudentLessonPlan extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lessonPlans : [],
      course : "",
      teacher : "",
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'lesson/getstudentlessonplan',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code != 200){
            swal({
              title: "Lesson Plan Saved!",
              text: "We are not able to get your lesson plan. Please reload the page.",
              icon: "warning",
              button: "ok",
            });
          }else{
            this.setState({
              lessonPlans : resp.data.lessons,
              teacher : resp.data.teacher,
              course : resp.data.course
            })
          }
          document.getElementById("loader").style.display = "none";
        })
      .catch(err => {
          console.log(err)
          swal({
            title: "Serrver Error!",
            text: "Please reload your page.",
            icon: "warning",
            button: "ok",
          });
          document.getElementById("loader").style.display = "none";
    })
    document.getElementById("loader").style.display = "none";
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
                    <h3>Lesson Plans of {this.state.course.coursename} by {this.state.teacher.firstname} {this.state.teacher.lastname}</h3>
                    <div className="div-scroll-y">
                      <div className="row justify-content-md-center">
                        {this.state.lessonPlans.map((element , index) => ( 
                            <div className="col-lg-2 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg">
                              <a id={element + 1} href={ '/studentlessonplandetails/'+element.id } style={{color:"#000"}}>
                                <i class="fa fa-book fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                                <label>{element.title}</label>
                              </a>
                            </div>
                        ))}
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


