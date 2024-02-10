import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class Packages extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      duration: 3,
      durations: []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'packages/getallPackages',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){
            this.setState({
                  items: resp.data.packages,
                  durations: resp.data.duration
              });
          }else{
            if(resp.data.code === 201){
              swal({
                title: "No Package Found!",
                text: "We are sorry there are currently no available package",
                icon: "warning",
                button: "ok",
              });
            }else{
              swal({
                title: "Server Error!",
                text: "Please try again",
                icon: "warning",
                button: "ok",
              });
            }
          }
        })
      .catch(err => {
          document.getElementById("loader").style.display = "none";
          console.log(err)
            swal({
              title: "Server Error!",
              text: "Please try again",
              icon: "warning",
              button: "ok",
            });
      })
  }

  handleInputChange = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  subscribePackage = (e) => {
    console.log(e.target.id)
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('subscription', e.target.id);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'subscription/createsubscription',
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
              title: "Thank you",
              text: "Your subscription will soon be confirmed",
              icon: "success",
              button: "ok",
            });
          }else{
            swal({
              title: "Package subscription failed",
              text: "Please try again",
              icon: "warning",
              button: "ok",
            });
          }
        })
      .catch(err => {
        document.getElementById("loader").style.display = "none";
        console.log(err)
          swal({
            title: "Server Error!",
            text: "Please try again",
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
                    <h3>Available Packages</h3>
                    <div className="row">
                      <div className="col-lg-3 col-md-3 mt-6 mt-lg-0">
                      </div>
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="duration">
                          <Form.Select aria-label="Please select duration for " onChange={this.handleInputChange}>
                            <option value="0" selected hidden >Select Duration</option>
                            {this.state.durations.map((item) => ( 
                              <option value={item.timing}>{item.timing} Months</option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </div>
                    <div className="row scroll div-scroll-y">
                    {this.state.items.filter(myitem => myitem.timing == this.state.duration).map((item) => ( 
                      <div className="col-lg-3 col-md-6 mt-4 mt-lg-0 size">
                        <div className="box price" id={item.packageid+"_price"}>
                          <h3>{item.course.coursename}</h3>
                          <h4><sup>$</sup>{item.packageprice}<span> / {item.timing} month</span></h4>
                          <ul>
                            <li>{item.noofstudent} Students Max</li>
                            <li>{item.noofclases} Classes (1 Hour Each)</li>
                            <li>Features</li>
                            <li>
                            <table className="table table-bordered">
                              {item.feature1 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature1}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature2 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature2}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature3 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature3}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature4 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature4}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature5 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature5}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature6 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature6}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature7 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature7}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              {item.feature8 !== "" ? 
                                <tr>
                                  <td className="table-cell">{item.feature8}</td>
                                  <td><i className="fas fa-check"></i></td>
                                </tr> : null
                              }
                              
                            </table>
                            </li>
                          </ul>

                          <div className="btn-wrap">
                            {item.status == 0 ? 
                              (<button className="form-control btn btn-outline-warning" onClick={this.subscribePackage} id={item.packageid}>Select</button>)
                             : 
                             (<button className="form-control btn btn-outline-secondary">Full</button>)
                           }
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