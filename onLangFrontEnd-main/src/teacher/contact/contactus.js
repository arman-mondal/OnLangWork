import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default class TeacherContactUs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        issue : "",
        message : "",
    }
  }

  componentDidMount(){
    document.getElementById("loader").style.display = "none";
  }

  sendMessage = (e) => {
    const savedToken = localStorage.getItem('loginToken');
    console.log(this.state.issue)
    console.log(this.state.message)
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('issue', this.state.issue);
    bodyFormData.append('message', this.state.message);
    axios({
      method: "post",
      url:  configData.SERVER_URL + 'contactus/teachercontactus',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : savedToken
      },
    }).then(resp => {
        if(resp.data.code === 200){
            swal({
                title: "Message",
                text: "We have received you message. We'll contact you soon",
                icon: "success",
                button: "ok",
              });
              this.setState({
                issue : "",
                message : "",
              })
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
                    <h3>Contact Us</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                        
                        <Form>

                            <h5 className='text-center text-secondary'>Call us</h5>
                            <p><strong className='text-center'><a className='link-secondary' href="tel:+971506479771"><i class="fa fa-phone"></i>+4400000000</a></strong></p>
                            <h5 className='text-center text-secondary'>or send us a message</h5>
                            <Form.Group className="mb-3 text-secondary">
                                <Form.Label>Please select an issue <span className="red">*</span></Form.Label>
                                <Form.Select aria-label="No Of Packages" onChange={(e) => {this.setState({issue : e.currentTarget.value})}}>
                                    <option value="Technical Issue">Technical</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3 text-secondary">
                                <Form.Label>Message<span className="red">*</span></Form.Label>
                                <CKEditor
                                    editor={ ClassicEditor }
                                    data={this.state.message}
                                    onReady={ editor => {
                                    } }
                                    onChange={ ( event, editor ) => {
                                        const data = editor.getData();
                                        console.log( { event, editor, data } );
                                        this.setState({
                                            message : data
                                        })
                                    } }
                                />
                            </Form.Group>
                        </Form>
                      </div>
                    </div>
                    <div className="btn-wrap-next">
                        <button type="button" className="btn-buy button-Next" onClick={this.sendMessage}>Send</button>
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