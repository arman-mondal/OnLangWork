import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class SubscritionsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      subscriptions : []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'subscription',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            subscriptions : resp.data.subscriptions
          });
          document.getElementById("loader").style.display = "none";
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
                    <h3>Subscriptions List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                      <Table striped bordered hover height="200">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Course</th>
                            <th>Accent</th>
                            <th>No of classes</th>
                            <th>No of students</th>
                            <th>Duration</th>
                            <th>Start Date</th>
                            <th>Expiry Date</th>
                            <th>Status</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.subscriptions.map((subscription , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{subscription.packages.course.coursename}</td>
                              <td>{subscription.packages.course.accent.accentname}</td>
                              <td>{subscription.packages.noofclases} Classes</td>
                              <td>{subscription.packages.noofstudent} Students</td>
                              <td>{subscription.packages.timing} Months</td>
                              <td>{ subscription.class.length > 0 ? moment(subscription.class[0].startdate).format('DD/MM/YYYY') : "Start Soon"}</td>
                              <td>{ subscription.class.length > 0 ? moment(subscription.class[0].endate).format('DD/MM/YYYY') : "Start Soon"}</td>
                              <td>
                                {(() => {
                                  switch (subscription.optionmenu) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                              <td><a href={ "/subscritiondetails/" + subscription.id} className="btn-buy">View</a></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
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