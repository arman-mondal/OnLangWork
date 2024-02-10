import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class GroupList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      groups : []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'groups/grouplist',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            groups : resp.data.groups
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
                    <h3>Groups List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Group Name</th>
                            <th>University Name</th>
                            <th>Course</th>
                            <th>Accent</th>
                            <th>Created On</th>
                            <th>Remaining Classes</th>
                            <th>Status</th>
                            <th>Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.groups.map((group , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{group.groupname}</td>
                              <td>{group.college.collegename}</td>
                              <td>{group.course.coursename}</td>
                              <td>{group.course.accent.accentname}</td>
                              <td>{ moment(group.createdon).format('DD/MM/YY')}</td>
                              <td>{group.classgroups.length > 0 ?   <> {group.classgroups[0].class.remainingclasses}</> : <></> }</td>
                              <td>
                                {(() => {
                                  switch (group.status) {
                                    case 0: return "Active";
                                    case 1: return "Pending Approval";
                                    case 2: return "Archived";
                                    default: return "Pending Approval";
                                  }
                                })()}
                              </td>
                              <td><a href={ "/groupdetails/" + group.groupid} className="btn-buy">View</a></td>
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