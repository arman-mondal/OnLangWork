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

export default class LessonPlan extends React.Component {

  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.state = {
      courseid: props.match.params.courseid,
      lessonPlans : [],
      lessonModal : false,
      selectedLesson : 0,
      lessontitle : "",
      lessondescription : "Please enter your lesson plan in details",
      selectedFiles : undefined,
      currentlessonPlans : [],
      course : ""
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('courseid', this.state.courseid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'lesson/getlessonplan',
        data: bodyFormData,
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
            for (let i = resp.data.lessons.length; i < 25; i++) {
              this.state.lessonPlans.push(i)
            }
            this.setState({
              currentlessonPlans : resp.data.lessons,
              lessonPlans : this.state.lessonPlans,
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

  lessonModalShow = (e) =>{
    console.log(e.currentTarget.id)
    this.setState({
      lessonModal : true,
      selectedLesson : e.currentTarget.id
    })
  }

  lessonModalHide = (e) =>{
    this.setState({
      lessonModal : false
    })
  }

  handleInputChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  onDrop(files) {
    if (files.length > 0) {
      if(files.length > 3){
        swal({
          title: "Max File Allowed!",
          text: "Please attach upto 3 attachements",
          icon: "warning",
          button: "ok",
        });
        return
      }
      this.setState({ selectedFiles: files });
    }
  }

  removeselectedfiles = (e) => {
      this.setState({ selectedFiles: undefined });
  }

  savelessonPlan = (e) => {
    const savedToken = localStorage.getItem('loginToken');
    if(this.state.lessontitle === "" || typeof this.state.lessontitle === "undefined"){
      swal({
          title: "Lesson Title!",
          text: "Please enter your lesson's title",
          icon: "warning",
          button: "ok",
        });
        return
    }
    if(this.state.lessondescription === "" || typeof this.state.lessondescription === "undefined"){
      swal({
          title: "Lesson Details!",
          text: "Please enter your lesson's details",
          icon: "warning",
          button: "ok",
        });
        return
    }
    if(this.state.selectedFiles.length < 1){
      swal({
          title: "Attach Files!",
          text: "Please attach a minimum of one file for your lesson",
          icon: "warning",
          button: "ok",
        });
        return
    }
    document.getElementById("loader").style.display = "block";
    var bodyFormData = new FormData();
    bodyFormData.append('courseid', this.state.courseid);
    bodyFormData.append('selectedLesson', this.state.selectedLesson);
    bodyFormData.append('lessontitle', this.state.lessontitle);
    bodyFormData.append('lessondescription', this.state.lessondescription);
    bodyFormData.append('filescount', this.state.selectedFiles.length); 
    this.state.selectedFiles.forEach((file,index) => {
      bodyFormData.append("files[]",file);
    })
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'lesson/createlessonplan',
        data: bodyFormData,
        headers: { 
          "Content-Type": "multipart/form-data",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
              currentlessonPlans : resp.data.lessons,
              lessonModal : false
            })
            swal({
              title: "Lesson Plan Saved!",
              text: "Your lesson plan has been saved successfully",
              icon: "success",
              button: "ok",
            });
          }else{
            swal({
              title: "Lesson Plan Saved!",
              text: "We were not able to save your lesson plan. Please reload the page and try again.",
              icon: "warning",
              button: "ok",
            });
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
                    <h3>Lesson Plans for {this.state.course.coursename}</h3>
                    <div className="row div-scroll-y justify-content-md-center">
                      {this.state.currentlessonPlans.map((element , index) => ( 
                          <div className="col-lg-2 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg">
                            <a id={element + 1} href={ '/lessonplandetails/'+element.id } style={{color:"#000"}}>
                              <i class="fa fa-book fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                              <label>{element.title}</label>
                            </a>
                          </div>
                      ))}
                      {this.state.lessonPlans.map((element , index) => ( 
                          <div className="col-lg-2 col-md-3 col-xs-6 mt-12 mt-lg-0 shadow-lg">
                            <a id={element + 1} onClick={this.lessonModalShow}>
                              <i class="fa fa-book fa-4x theme-color p-3" aria-hidden="true"></i><br/>
                              <label>Lesson {element + 1}<br/><a className="lesson-anchor">click here to create</a></label>
                            </a>
                          </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
           <Modal show={this.state.lessonModal} onHide={this.lessonModalHide} aria-labelledby="contained-modal-title-vcenter" centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Detail Plan for Lesson#{this.state.selectedLesson}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <div className="row">
                  <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                    <Form.Group className="mb-3" controlId="lessontitle">
                     <Form.Label>Lesson Title<span className="red">*</span></Form.Label>
                      <Form.Control type="text" placeholder="Please enter title for your lesson" value={this.state.lessontitle} onChange={this.handleInputChange}/>
                    </Form.Group>  
                   </div>
                   <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                    <CKEditor
                        editor={ ClassicEditor }
                        data={this.state.lessondescription}
                        config={
                          {
                            ckfinder: {
                              uploadUrl: `${configData.SERVER_URL}uploadImage`
                            },
                          }
                        }
                        onReady={ editor => {
                            // You can store the "editor" and use when it is needed.
                            console.log( 'Editor is ready to use!', editor );
                        } }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();
                            console.log( { event, editor, data } );
                            this.setState({
                              lessondescription : data
                            })
                        } }
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                    <Dropzone onDrop={this.onDrop}>
                      {({ getRootProps, getInputProps }) => (
                        <section style={{width:"100%"}}>
                          <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            {this.state.selectedFiles &&
                            Array.isArray(this.state.selectedFiles) &&
                            this.state.selectedFiles.length ? (
                              <div className="selected-file">
                                {this.state.selectedFiles.length > 3
                                  ? `${this.state.selectedFiles.length} files`
                                  : this.state.selectedFiles.map((file) => file.name).join(", ")}
                              </div>
                            ) : (
                              `Drag and drop files here, or click to select upto 3 files`
                            )}
                          </div>
                          <aside className="selected-file-wrapper">
                            <Button className="float-right" variant="warning" onClick={this.removeselectedfiles}>Remove Selected Documents</Button>
                          </aside>
                        </section>
                      )}
                    </Dropzone>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.lessonModalHide}>Close</Button>
              <Button variant="warning" onClick={this.savelessonPlan}>Save Changes</Button>
            </Modal.Footer>
          </Modal>
      </header>
      </div>
      )
    }
}


