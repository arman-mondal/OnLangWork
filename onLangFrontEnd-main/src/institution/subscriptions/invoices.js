import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";

export default class InvoicesList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      invoices : []
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'invoices/',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            invoices : resp.data.invoices
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
                    <h3>Invoices List</h3>
                    <div className="row div-scroll-y">
                      <div className="col-lg-12 col-md-12 mt-12 mt-lg-0">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Course</th>
                            <th>Accent</th>
                            <th>Course Length</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.invoices.map((invoice , index) => ( 
                            <tr>
                              <td>{index + 1}</td>
                              <td>{invoice.subcriptions.packages.course.coursename}</td>
                              <td>{invoice.subcriptions.packages.course.accent.accentname}</td>
                              <td>{invoice.subcriptions.packages.timing}</td>
                              <td>{invoice.total}</td>
                              <td>{ moment(invoice.duedate).format('DD/MM/YYYY')}</td>
                              <td>
                                {(() => {
                                  switch (invoice.status) {
                                    case 0: return "Payment Due";
                                    case 1: return "Payment Overdue";
                                    case 2: return "Payment Done";
                                    default: return "Payment Due";
                                  }
                                })()}
                              </td>
                              <td><a href={ "/invoicedetails/" + invoice.id} className="btn-buy">View</a></td>
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