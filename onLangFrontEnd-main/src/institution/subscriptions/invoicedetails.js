import 'bootstrap/dist/css/bootstrap.min.css';
import './invoice.css';
import axios from 'axios';
import React from 'react';
import Loader from "react-js-loader";
import {Form, Card, Badge, Table} from "react-bootstrap";
import swal from 'sweetalert';
import configData from "../../config.json";
import moment from "moment";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default class InvoiceDetails extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      invoice : "",
      invoiceid: props.match.params.invoiceid,
    }
  }
  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('invoiceid', this.state.invoiceid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'invoices/details',
        data : bodyFormData,
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
         },
      }).then(resp => {
          console.log(resp.data)
          this.setState({
            invoice : resp.data.invoice
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

  generatePDF = () => {
    const domElement = document.querySelector('#invoice')
    html2canvas(domElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg')
      const pdf = new jsPDF("p", "mm", "a4");
      var width = pdf.internal.pageSize.getWidth();
      var height = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
      pdf.save('invoice.pdf')
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
              <div id="print">
                <a onClick={this.generatePDF} className="btn-buy float-right"><i className="fa fa-file-pdf"></i> Save</a>
              </div>
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3" id="invoice">
                    <header class="clearfix">
                      <div id="logo">
                        <img src="/Images/logo.png"/>
                      </div>
                      <h1 className="invoice-number">INVOICE NO#{this.state.invoice.id}</h1>
                      <div id="company" class="clearfix">
                        <div><strong>OnLang Ltd</strong></div>
                        <div>90a High Street, Berkhamsted,<br/>HERTFORDSHIRE HP4 2BL<br/> London, UK</div>
                        <div>+44(0) 7971 560 455</div>
                        <div><a href="mailto:mariam@onlang.net">mariam@onlang.net</a></div>
                      </div>
                      <div id="project">
                        <div><strong>{this.state.invoice == "" ? "" : this.state.invoice.college.collegename + " " + this.state.invoice.college.collegetype}</strong></div>
                        <div><span>Address: </span>{this.state.invoice == "" ? "" : this.state.invoice.college.city + " " + this.state.invoice.college.country}</div>
                        <div><span>Email: </span> <a href="mailto:{this.state.invoice == '' ? '' : this.state.invoice.college.email}">{this.state.invoice == "" ? "" : this.state.invoice.college.email}</a></div>
                        <div><span>Date: </span> { moment(this.state.invoice.createdon).format('MMMM DD,YYYY')}</div>
                        <div><span>Due Date: </span> { moment(this.state.invoice.duedate).format('MMMM DD,YYYY')}</div>
                      </div>
                    </header>
                    <main id="invoice-table">
                      <table>
                        <thead>
                          <tr>
                            <th class="service">Course</th>
                            <th class="service">Accent</th>
                            <th class="desc">DESCRIPTION</th>
                            <th>PRICE</th>
                            <th>QTY</th>
                            <th>TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="service">{this.state.invoice == "" ? "" : this.state.invoice.subcriptions.packages.course.coursename}</td>
                            <td class="service">{this.state.invoice == "" ? "" : this.state.invoice.subcriptions.packages.course.accent.accentname}</td>
                            <td class="desc">{this.state.invoice == "" ? "" : this.state.invoice.subcriptions.packages.course.description}</td>
                            <td class="unit">$40.00</td>
                            <td class="qty">26</td>
                            <td class="total">$1,040.00</td>
                          </tr>
                          <tr><td colspan="6"></td></tr>
                          <tr>
                            <td colspan="5">SUBTOTAL</td>
                            <td class="total">${this.state.invoice.subtotal}</td>
                          </tr>
                          <tr>
                            <td colspan="5">TAX 25%</td>
                            <td class="total">${this.state.invoice.vat}</td>
                          </tr>
                          <tr>
                            <td colspan="5" class="grand total">GRAND TOTAL</td>
                            <td class="grand total">${this.state.invoice.total}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div>
                        <div class="notice"> NOTICE: A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                      </div>
                      <div>
                        <div class="footer"> Invoice was created on a computer and is valid without the signature and seal.</div>
                      </div>
                    </main>
                  </Card>
                </div>
              </div>
          </div>
        </section>
    </header>
  </div>
  )}
}