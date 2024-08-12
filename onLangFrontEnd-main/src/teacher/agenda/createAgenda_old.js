import './agenda.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import {Form, Button, Card, Row, Alert, Badge} from "react-bootstrap";

export default class CreateAgenda extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      show: 0,
      slots: [],
      selectedSlots: [],
      days: [],
      selectedDays: []
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    const savedToken = localStorage.getItem('loginToken');
    this.getSlots();
    
    document.getElementById("slotSelectSection").style.display = "none";
    document.getElementById("slotViewSection").style.display = "none";
    document.getElementById("loader").style.display = "none";
  }

  getSlots(){
     axios({
      method: "get",
      url:  configData.SERVER_URL + 'slots/getall',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : this.props.match.params.token
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            slots : resp.data.slots,
            days : resp.data.days
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


  selectDay = (day) => {
    this.setState(prevState => ({
        selectedDays: [...prevState.selectedDays, day],
        days: this.state.days.filter(function(preDay) { 
          return preDay !== day
        })
      }))
  }

  removeDay = (day) => {
    this.setState(prevState => ({
        days: [...prevState.days, day],
        selectedDays: this.state.selectedDays.filter(function(selectedDay) { 
          return selectedDay !== day
        }),
        selectedSlots: this.state.selectedSlots.filter(function(selectedSlot) { 
          return selectedSlot.day.id !== day.id
        })
      }))
  }

  addSlot = (slot, day) => {
    var selectedSlot = { slot : slot, day: day};
    var preSlot = this.state.selectedSlots.find(function(preSelectedSlot) { 
          return preSelectedSlot.slot.slotid == slot.slotid && preSelectedSlot.day.id == day.id
        })
    console.log(preSlot)
    if(preSlot == null){
      this.setState(prevState => ({
          selectedSlots: [...prevState.selectedSlots, selectedSlot],
      }))
    }
  }

  removeSlot = (slot) => {
    this.setState(prevState => ({
        selectedSlots: this.state.selectedSlots.filter(function(selectedSlot) { 
          return selectedSlot !== slot
        })
      }))
  }


  daysBackClick = (e) => {
    document.getElementById("studentSelectSection").style.display = "block";
    document.getElementById("daysSelectSection").style.display = "none";
  }

  daysSelected = (e) => {
    if(this.state.selectedDays.length < 2){
      swal({
            title: "Selection Issue",
            text: "Please select atleast 2 days for group!",
            icon: "warning",
            button: "ok",
          });
      return;
    }
    document.getElementById("daysSelectSection").style.display = "none";
    document.getElementById("slotSelectSection").style.display = "block";
  }

  slotsBackClick = (e) => {
    document.getElementById("daysSelectSection").style.display = "block";
    document.getElementById("slotSelectSection").style.display = "none";
  }

  slotSelected = (e) => {
    console.log(this.state.selectedSlots)
    document.getElementById("slotViewSection").style.display = "block";
    document.getElementById("slotSelectSection").style.display = "none";
  }

  groupViewBackClicked = (e) => {
    document.getElementById("slotSelectSection").style.display = "block";
    document.getElementById("slotViewSection").style.display = "none";
  }

  hitAgendaCreationApi = (e) => {
    document.getElementById("loader").style.display = "block";
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('selectedSlots', JSON.stringify(this.state.selectedSlots));
    axios({
        method: "post",
        url: configData.SERVER_URL + 'teachers/createagenda',
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
              title: "Agenda",
              text: "Agenda created successfully",
              icon: "success",
              button: "ok",
            }).then(function(){
                window.location.href = "/agenda";
            });
          }else{
            swal({
              title: "Server Error!",
              text: "Please try again!",
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
          <section className="pricing" id="daysSelectSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Agenda</h3>
                    <div className="row d-flex align-items-center justify-content-center div-scroll-y">
                      <h5 className="text-center">Please select your available days for classes</h5>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>Select days</strong></li>
                        </ul>
                        <ul className="list-group selectbox">
                          {this.state.selectedDays.map((selectedDay) => ( 
                            <li className="list-group-item list-group-item-secondary" onClick={e => this.removeDay(selectedDay)}> 
                              <div className="selectInnerDiv">
                                <div className="studentInfo"> 
                                  {selectedDay.day}
                                </div>
                                <div className="badgeInfo">
                                  <Badge bg="light"><i class="fa fa-check fa-2xs" aria-hidden="true"></i></Badge>
                                </div>
                              </div>

                            </li>
                            )
                          )}
                          {this.state.days.map((day) => ( 
                            <li class="list-group-item list-group-item-secondary" onClick={e => this.selectDay(day)}> 
                              <div className="selectInnerDiv">
                                <div className="studentInfo">
                                  {day.day}
                                </div>
                                <div className="badgeInfo">
                                  <Badge bg="light"><i class="fa fa-check fa-2xs text-light" aria-hidden="true"></i></Badge>
                                </div>
                              </div>
                            </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="col-lg-1 col-md-1 d-flex align-items-center justify-content-center">
                          <i className="fas fa-caret-right fa-2x" aria-hidden="true"></i>
                      </div>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>Selected days</strong></li>
                        </ul>
                        <ul className="list-group selectbox">
                          {this.state.selectedDays.map((selectedDay) => ( 
                            <li className="list-group-item list-group-item-secondary" onClick={e => this.removeDay(selectedDay)}> 
                              {selectedDay.day}
                            </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="btn-wrap-next">
                      <button type="submit" className="btn-buy button-Next" onClick={this.daysSelected}>Next</button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          <section className="pricing" id="slotSelectSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Agenda</h3>
                    <div className="row d-flex align-items-center justify-content-center div-scroll-y">
                      <h5 className="text-center">Please select your available slots for classes</h5>
                      {this.state.selectedDays.map((selectedDay) => ( 
                        <div className="row mb-3">
                          <div className="col-lg-5 col-md-5">
                            <ul class="list-group">
                              <li class="list-group-item selectliHead"><strong>Available slots for {selectedDay.day}</strong></li>
                            </ul>
                            <ul className="list-group selectbox">
                              
                              { this.state.slots.map((slot) => (
                                <li className="list-group-item list-group-item-secondary" onClick={e => this.addSlot(slot,selectedDay)}> 
                                  {slot.name} ({moment(slot.starttime).format('h:mm:ss A')}-{moment(slot.endtime).format('h:mm:ss A')})
                                </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="col-lg-1 col-md-1 d-flex align-items-center justify-content-center">
                              <i className="fas fa-caret-right fa-2x" aria-hidden="true"></i>
                          </div>
                          <div className="col-lg-5 col-md-5">
                            <ul class="list-group">
                              <li class="list-group-item selectliHead"><strong>Selected slots for {selectedDay.day}</strong></li>
                            </ul>
                            <ul className="list-group selectbox">
                              {this.state.selectedSlots.filter(selectedSlot => selectedSlot.day == selectedDay).map(filteredSelectedSlot => (
                                <li className="list-group-item list-group-item-secondary" onClick={e => this.removeSlot(filteredSelectedSlot)}> 
                                <div className="selectInnerDiv">
                                    <div className="studentInfo"> 
                                      {filteredSelectedSlot.slot.name} {moment(filteredSelectedSlot.slot.starttime).format('h:mm:ss A')}-{moment(filteredSelectedSlot.slot.endtime).format('h:mm:ss A')})
                                    </div>
                                    <div className="badgeInfo">
                                      <Badge bg="warning">Remove</Badge>
                                    </div>
                                  </div>
                                </li> 
                              ))}
                            </ul>
                          </div>
                        </div>
                        )
                      )}
                    </div>
                    <div className="btn-wrap-next">
                      <button type="button" className="btn-buy button-Next" onClick={this.slotsBackClick}>Back</button>
                      <button type="submit" className="btn-buy button-Next" onClick={this.slotSelected}>Next</button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          <section className="pricing" id="slotViewSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Agenda</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center">Confirm Agenda</h5>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>Selected Days and Slots</strong></li>
                        </ul>
                        <ul class="list-group selectedbox">
                          {this.state.selectedSlots.map((selectedSlot) => ( 
                            <li class="list-group-item list-group-item-secondary" style={{ backgroundColor: selectedSlot.day.colorcode}}> 
                            {selectedSlot.day.day} {selectedSlot.slot.name} {moment(selectedSlot.slot.starttime).format('h:mm:ss A')}-{moment(selectedSlot.slot.endtime).format('h:mm:ss A')})
                            </li>
                            )
                            )}
                        </ul>
                      </div>
                    </div>
                    <div className="btn-wrap-next">
                      <button type="button" className="btn-buy button-Next" onClick={this.groupViewBackClicked}>Back</button>
                      <button type="submit" className="btn-buy button-Next" onClick={this.hitAgendaCreationApi}>Confirm</button>
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
