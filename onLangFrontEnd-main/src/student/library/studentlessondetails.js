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

export default class StudentLessonPlanDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lessonid: props.match.params.lessonid,
      lessontitle : "",
      lessondescription : "Please enter your lesson plan in details",
      lessonPlan : "",
      files : [],
      selectedFiles : undefined,
      lessonModal : false,
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('lessonid', this.state.lessonid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'lesson/getstudentlessonplandetails',
        data: bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code != 200){
            swal({
              title: "Invalid Access!",
              text: "You are not allowed to view this lesson",
              icon: "warning",
              button: "ok",
            });
          }else{
            this.setState({
              lessonPlan : resp.data.lesson,
              lessontitle : resp.data.lesson.title,
              lessondescription : resp.data.lesson.description,
              files : JSON.parse(resp.data.lesson.attachments)
            })
            console.log(this.state.files)
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
                    <h3>{this.state.lessontitle}</h3>
                    <div className="row div-scroll-y" style={{textAlign:"left"}}>
                      <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                        <CKEditor
                            editor={ ClassicEditor }
                            data={this.state.lessondescription}
                            disabled= "true"
                            onReady={ editor => {
                                editor.ui.view.toolbar.element.remove();
                                console.log( 'Editor is ready to use!', editor );
                            } }
                        />
                      </div>
                      <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                        <h5>Attachements</h5>
                        {this.state.files.map((file , index) => ( 
                          <h6> 
                            <a href={configData.SERVER_URL + file} target="_blank" style={{color:"#000"}}>Click here to download attachement {index + 1}</a>
                          </h6>
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


