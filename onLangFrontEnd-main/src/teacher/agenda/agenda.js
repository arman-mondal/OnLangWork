import './agenda.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import {Form, Button, Card, Row, Alert, Badge} from "react-bootstrap";

export default class Agenda extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      agenda: []
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    const savedToken = localStorage.getItem('loginToken');
    this.getAgenda(savedToken);
    document.getElementById("loader").style.display = "none";
  }

  getAgenda(savedToken){
    console.log(savedToken);
     axios({
      method: "get",
      url:  configData.SERVER_URL + 'teachers/getgenda',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : savedToken
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            agenda : resp.data.agenda,
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

  editAgenda = (e) => {
    window.location.href = '/updateagenda';
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
                    <h3>Teachers Agenda</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center"></h5>
                      {this.state.agenda.length > 0 ?
                        <div className="col-lg-5 col-md-5">
                          <ul class="list-group">
                            <li class="list-group-item selectliHead h5"><strong>Selected Days and Slots</strong></li>
                          </ul>
                          <ul class="list-group selectedbox">
                            {this.state.agenda.map((agen) => ( 
                              <li class="list-group-item list-group-item-secondary" style={{ backgroundColor: agen.colorcode}}> 
                              {agen.days.day} {agen.slots.name} {moment(agen.slots.starttime).format('h:mm A')}-{moment(agen.slots.endtime).add(1, 'minute').format('h:mm A')})
                              </li>
                              )
                              )}
                          </ul>
                        </div> : 
                        <div>
                          <strong><a href="/createagenda" className="btn-buy">Create Agenda</a></strong>
                        </div>
                      }
                    </div>
                    <div className="btn-wrap-next">
                      <form action="/createagenda">
                        { this.state.agenda.length > 0 ? <button type="button" onClick={this.editAgenda} className="btn-buy button-Next">Edit</button>:<button type="submit" className="btn-buy button-Next">Create New</button>}
                        
                      </form>
                    </div>
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
