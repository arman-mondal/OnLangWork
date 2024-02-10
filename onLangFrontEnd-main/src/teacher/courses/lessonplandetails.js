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

export default class LessonPlanDetails extends React.Component {

  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
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
        url:  configData.SERVER_URL + 'lesson/getlessonplandetails',
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

  updatelessonPlan = (e) => {
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
    document.getElementById("loader").style.display = "block";
    var bodyFormData = new FormData();
    bodyFormData.append('lessonid', this.state.lessonid);
    bodyFormData.append('lessontitle', this.state.lessontitle);
    bodyFormData.append('lessondescription', this.state.lessondescription);
    if(this.state.selectedFiles===undefined){
      bodyFormData.append('filescount', 0);
    }else{
      bodyFormData.append('filescount', this.state.selectedFiles.length);
      this.state.selectedFiles.forEach((file,index) => {
        bodyFormData.append(index,file);
      })
    }
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'lesson/updatelessonplan',
        data: bodyFormData,
        headers: { 
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          if(resp.data.code == 200){
            this.setState({
              lessonPlan : resp.data.lesson,
              lessontitle : resp.data.lesson.title,
              lessondescription : resp.data.lesson.description,
              files : JSON.parse(resp.data.lesson.attachments),
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
              text: "We are not able to save your lesson plan. Please reload the page and try again.",
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
                    <div className="btn-wrap-next">
                      <button className="btn-buy button-Next" onClick={this.lessonModalShow}>Update</button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
           <Modal show={this.state.lessonModal} onHide={this.lessonModalHide} aria-labelledby="contained-modal-title-vcenter" centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Update Lesson Plan</Modal.Title>
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
              <Button variant="warning" onClick={this.updatelessonPlan}>Save Changes</Button>
            </Modal.Footer>
          </Modal>
      </header>
      </div>
      )
    }
}


