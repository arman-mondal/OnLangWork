import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {Form, Button, Card, Row, Alert, Badge} from "react-bootstrap";
import DOMPurify from 'dompurify'

export default class StudentAssignmentDetails extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
        assignmentId: props.match.params.id,
        classassignment: props.match.params.classassignid,
        assignment : null,
        questions : [],
        answers : []
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    const savedToken = localStorage.getItem('loginToken');
    this.getAssignmentDetails(savedToken);
    document.getElementById("loader").style.display = "none";
  }

  getAssignmentDetails(savedToken){
     axios({
      method: "get",
      url:  configData.SERVER_URL + 'assignment/getstudentassignmentdetails/' + this.state.assignmentId,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : savedToken
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code === 200){
            let answers = []
            resp.data.assignment.assignmentquestions.forEach(question => {
                answers.push({
                    question : question.id,
                    answer : null
                })
            });
            this.setState({
                assignment : resp.data.assignment,
                answers : answers
            });
        }else{
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
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

  updateAssignment = (e) => {
    e.preventDefault()
    console.log(this.state.answers)
    let flag = false
    this.state.answers.forEach(answer => {
        if(answer.answer == null){
            swal({
                title: "Incomplete Assignment",
                text: "Please complete your assignment!",
                icon: "warning",
                button: "ok",
            });
            flag = true
        }
    })
    if(flag){
        return
    }
    document.getElementById("loader").style.display = "block";
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('assignment', this.state.assignmentId);
    bodyFormData.append('classassignment', this.state.classassignment);
    bodyFormData.append('answers', JSON.stringify(this.state.answers));
    axios({
        method: "post",
        url: configData.SERVER_URL + 'assignment/submitassignment',
        data: bodyFormData,
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "authtoken" : savedToken
            },
    }).then(resp => {
        console.log(resp.data)
        document.getElementById("loader").style.display = "none";
        if(resp.data.code === 200){
            swal({
                title: "Assignment",
                text: "Assignment submited successfully",
                icon: "success",
                button: "ok",
            }).then(function() {
                window.location = "/studentassignments"
            });
        }else{
            swal({
                title: "Server Error!",
                text: "Please try again!",
                icon: "warning",
                button: "ok",
            });
        }
    }).catch(err => {
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
          <section className="pricing" id="slotViewSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Assigment</h3>
                    { this.state.assignment ? 
                        <Form>
                            <div className="row p-2" style={{height: "25rem",overflowY:"scroll"}}>

                                {this.state.assignment.assignmentquestions.map ( (question, index) => (
                                    <>
                                        <div className="col-lg-12 col-md-12">
                                            <div style={{textAlign:"left"}}><strong>Question No {index + 1}:</strong></div>
                                            <div class="container" style={{textAlign:"left"}} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(question.question)}}></div>
                                        </div>
                                        <div className="row mb-2">
                                            { question.ismultipechoice ? 
                                                <>
                                                <div style={{textAlign:"left"}}><strong>Select your answer.</strong></div>
                                                {question.mcqs.map ( (mcq) => (
                                                    <div className="col-lg-6 col-md-6 mt-6 mt-lg-0 p-2" style={{textAlign:"left"}}>
                                                        <Form.Check inline type="radio" id={`question-${question.id}`}  name={`question-${question.id}`} value={mcq.id} label={mcq.option} onChange={(e) => {
                                                            this.state.answers[index].answer = e.currentTarget.value
                                                            this.setState({
                                                                answers : this.state.answers
                                                            })
                                                        }}/>
                                                    </div>
                                                ))}
                                                </>
                                                :
                                                <div className="col-lg-12 col-md-12 mt-12 mt-lg-0" style={{textAlign:"left"}}>
                                                    <div style={{textAlign:"left"}}><strong>Explain your answer.</strong></div>
                                                    <CKEditor
                                                        editor={ ClassicEditor }
                                                        data=""
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
                                                            this.state.answers[index].answer = data
                                                            this.setState({
                                                                answers : this.state.answers
                                                            })
                                                        } } />
                                                </div>
                                            }
                                        </div>
                                        <hr class="hr mt-2" style={{backgroundColor:"#ccced1"}} />
                                    </>
                                ))}


                            </div>
                            <div className="btn-wrap-next">
                            <form action="/createagenda">
                                <button type="submit" className="btn-buy button-Next" onClick={this.updateAssignment}>Submit Assigment</button>
                            </form>
                            </div>
                        </Form>
                        : <></>
                    }
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </header>
      </div>
    );
  }

}
