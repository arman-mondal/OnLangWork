import './groups.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import {Form, Button, Card, Row, Alert, Badge} from "react-bootstrap";

export default class CreateGroup extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      show: 0,
      retrivedStudents: [],
      filterStudents: [],
      students: [],
      selectedStudents: [],
      slots: [],
      selectedSlots: [],
      days: [],
      selectedDays: [],
      selectedPackage : 0,
      selectedSubscription : 0,
      selectedCourse : 0,
      coursename: '',
      noofclases: 0,
      showInvitebtn: false,
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    const savedToken = localStorage.getItem('loginToken');
    this.getSlots();
    this.getStudents(savedToken);
    
    document.getElementById("slotSelectSection").style.display = "none";
    document.getElementById("daysSelectSection").style.display = "none";
    document.getElementById("groupViewSection").style.display = "none";
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
          
        }
      })
    .catch(err => {
      swal({
        title: "Server Not Responding ",
        text: "Please reload the page",
        icon: "warning",
        button: "ok",
      });
    })
  }

  getStudents(savedToken){
    axios({
        method: "get",
        url: configData.SERVER_URL + 'students/getInstitutionStudents',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
        },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){
            this.setState({
              students : resp.data.students,
              retrivedStudents : resp.data.students,
              filterStudents : resp.data.students
            })
          }else{
            swal({
              title: "Server Error!",
              text: "Please reload the page",
              icon: "warning",
              button: "ok",
            });
          }
        })
      .catch(err => {
          console.log(err)
          document.getElementById("loader").style.display = "none";
          swal({
            title: "Server Error!",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
      })
  }

  selectStudent = (student) => {
    console.log(student);
    if(this.state.selectedPackage == 0 || this.state.selectedPackage == student.packageid){
      this.setState(prevState => ({
        selectedStudents: [...prevState.selectedStudents, student],
        students: this.state.students.filter(function(preStudent) { 
          return preStudent !== student
        }),
        filterStudents : this.state.filterStudents.filter(function(preStudent) { 
          return preStudent !== student
        }),
        selectedPackage: student.packageid,
        selectedSubscription: student.subscritionid,
        selectedCourse: student.courseid,
        coursename: student.coursename,
        noofclases: student.noofclases
      }));
    }else{
      swal({
            title: "Selection Issue",
            text: "Please select the students for the same course",
            icon: "warning",
            button: "ok",
          });
    }
  }

  removeStudent = (student) => {
    this.setState(prevState => ({
      students: [...prevState.students, student],
      filterStudents: [...prevState.filterStudents, student],
      selectedStudents: this.state.selectedStudents.filter(function(selectedStudent) { 
        return selectedStudent !== student
      })
    }));
    console.log(this.state.selectedStudents.length);
    if(this.state.selectedStudents.length < 2){
      this.setState({
        selectedPackage: 0,
        selectedSubscription : 0,
        selectedCourse : 0,
        coursename: "",
        noofclases: 0
      })
    }
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
        })
      }))
  }
  handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
  
    if (searchValue === '') {
      this.setState({
        students: this.state.filterStudents,
        showInviteButton: false, // Hide the invite button when the search is empty
      });
      return;
    }
  
    const filteredStudents = this.state.filterStudents.filter((student) => {
      const fullName = (student.firstname + ' ' + student.lastname).toLowerCase();
      return (
        fullName.includes(searchValue) ||
        student.coursename.toLowerCase().includes(searchValue)
      );
    });
  
    if (filteredStudents.length === 0 && searchValue.includes('@')) {
      // If no students found and search value contains email addresses
      const emails = searchValue.split(',').map(email => email.trim());
      this.setState({
        students: [],
        showInviteButton: true, // Display the invite button
        invitedEmails: emails, // Store the split emails in a different variable
      });
    } else {
      // If students found, update the student list
      this.setState({
        students: filteredStudents,
        showInviteButton: false, // Hide the invite button
        invitedEmails: [], // Clear invitedEmails if students are found
      });
    }
  };
  
  
  inviteStudent = () => {
    if(this.state.invitedEmails.length <4) {
      swal({
            title: "Selection Issue",
            text: "Please select a minimum of 4 students by group",
            icon: "warning",
            button: "ok",
          });

      return;

    }

    console.log(this.state.invitedEmails)

    const savedToken = localStorage.getItem('loginToken');
    const bodyFormData = new FormData();
    bodyFormData.append('emails', JSON.stringify(this.state.invitedEmails));
    bodyFormData.append('packageid', JSON.stringify(this.state.selectedPackage));
    bodyFormData.append('subscriptionid', JSON.stringify(this.state.selectedSubscription));
    bodyFormData.append('courseid', JSON.stringify(this.state.selectedCourse));
    bodyFormData.append('coursename', JSON.stringify(this.state.coursename));
    bodyFormData.append('noofclases', JSON.stringify(this.state.noofclases));

    console.log({
      emails: this.state.invitedEmails,
      packageid: this.state.selectedPackage,
      subscriptionid: this.state.selectedSubscription,
      courseid: this.state.selectedCourse,
      coursename: this.state.coursename,
      noofclases: this.state.noofclases,
    
    })

  }
  studentsSelected = (e) => {
    if(this.state.selectedStudents.length < 4){
      swal({
            title: "Selection Issue",
            text: "Please select a minimum of 4 students by group",
            icon: "warning",
            button: "ok",
          });
      return;
    }
    document.getElementById("studentSelectSection").style.display = "none";
    document.getElementById("daysSelectSection").style.display = "block";
  }

  daysBackClick = (e) => {
    document.getElementById("studentSelectSection").style.display = "block";
    document.getElementById("daysSelectSection").style.display = "none";
  }

  daysSelected = (e) => {
    if(this.state.selectedDays.length < 2){
      swal({
            title: "Selection Issue",
            text: "Please select a minimum of 2 days by group!",
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
    const seletedDayandSlot = []
    this.state.selectedDays.forEach((day) => {
      if(document.getElementById(day.id+"_select").value == "0"){
        swal({
            title: "Selection Issue",
            text: "Please select a slot for each day",
            icon: "warning",
            button: "ok",
          });
        return;
      }
      else{
        const selectedDay = this.state.selectedDays.find(myDay => {
          return myDay.id === day.id;
        });
        const selectedSlot = this.state.slots.find(allSlot => {
          return allSlot.slotid == document.getElementById(day.id+"_select").value;
        });
        seletedDayandSlot.push({ day: selectedDay, slot: selectedSlot});
        console.log(selectedSlot)
      }
    })
    this.setState({ 
      selectedSlots: seletedDayandSlot
    })
    console.log(seletedDayandSlot)
    document.getElementById("groupViewSection").style.display = "block";
    document.getElementById("slotSelectSection").style.display = "none";
  }

  groupViewBackClicked = (e) => {
    document.getElementById("slotSelectSection").style.display = "block";
    document.getElementById("groupViewSection").style.display = "none";
  }

  hitGroupCreationApi = (e) => {
    document.getElementById("loader").style.display = "block";
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('selectedStudents', JSON.stringify(this.state.selectedStudents));
    bodyFormData.append('selectedPackage', JSON.stringify(this.state.selectedPackage));
    bodyFormData.append('selectedSubscription', JSON.stringify(this.state.selectedSubscription));
    bodyFormData.append('selectedSlots', JSON.stringify(this.state.selectedSlots));
    bodyFormData.append('selectedCourse', JSON.stringify(this.state.selectedCourse));
    bodyFormData.append('coursename', JSON.stringify(this.state.coursename));
    bodyFormData.append('noofclases', JSON.stringify(this.state.noofclases));
    axios({
        method: "post",
        url: configData.SERVER_URL + 'groups/creategroup',
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
              title: "Groups",
              text: "Group successfully created",
              icon: "success",
              button: "ok",
            }).then(function(){
                window.location.reload();
            });
          }else{
            swal({
              title: "Server Error!",
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
          <section className="pricing" id="studentSelectSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Groups</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center">Please select up to 8 students for this group</h5>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>New Students</strong></li>
                          <li class="list-group-item list-group-item-secondary">
                          <Form.Group controlId="department">
                            <Form.Control type="text" size="sm" placeholder="search..." onChange={this.handleSearchChange}/>
                          </Form.Group>
                          </li>
                        </ul>
                        <ul className="list-group selectbox">
                        {/*this.state.showInviteButton && (
          <li className="list-group-item list-group-item-secondary">
            <button
              className="btn btn-primary"
              onClick={this.inviteStudent}
            >
              Invite Student
            </button>
          </li>
                        )*/}
                          {this.state.selectedStudents.map((selectedStudent) => ( 
                            <li class="list-group-item list-group-item-secondary" onClick={e => this.removeStudent(selectedStudent)}> 
                              <div className="selectInnerDiv">
                                <div className="studentInfo">
                                  {selectedStudent.firstname + " " + selectedStudent.lastname + " ("}<strong>{selectedStudent.coursename + " " + selectedStudent.timing + " months"}</strong>{"-" + selectedStudent.accentname + " Accent)"}
                                </div>
                                <div className="badgeInfo">
                                  <Badge bg="light"><i class="fa fa-check fa-2xs" aria-hidden="true"></i></Badge>
                                </div>
                              </div>
                            </li>
                            )
                            )}
                          {this.state.students.map((student) => ( 
                            <li className="list-group-item list-group-item-secondary" onClick={e => this.selectStudent(student)}> 
                              <div className="selectInnerDiv">
                                <div className="studentInfo"> 
                                  {student.firstname + " " + student.lastname + " ("}<strong>{student.coursename + " " + student.timing + " months"}</strong>{"-" + student.accentname + " Accent)"}
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
                          <li class="list-group-item selectliHead"><strong>Selected Students</strong></li>
                        </ul>
                        <ul class="list-group selectedbox">
                          {this.state.selectedStudents.map((selectedStudent) => ( 
                            <li class="list-group-item list-group-item-secondary" onClick={e => this.removeStudent(selectedStudent)}> 
                                  {selectedStudent.firstname + " " + selectedStudent.lastname + " ("}<strong>{selectedStudent.coursename + " " + selectedStudent.timing + " months"}</strong>{"-" + selectedStudent.accentname + " Accent)"}
                            </li>
                            )
                            )}
                        </ul>
                      </div>
                    </div>
                    <div className="btn-wrap-next">
                      <button type="submit" className="btn-buy button-Next" onClick={this.studentsSelected}>Next</button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          <section className="pricing" id="daysSelectSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Groups</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center">Preferred days for group class</h5>
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
                      <button type="button" className="btn-buy button-Next" onClick={this.daysBackClick}>Back</button>
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
                    <h3>Create Groups</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center">Preferred time for slots (GMT time zone)</h5>
                      {this.state.selectedDays.map((selectedDay) => ( 
                        <div className="row">
                          <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                            <label className="form-control alert alert-secondary">{selectedDay.day}</label>
                          </div>
                          <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                            <Form.Group controlId={selectedDay.id+"_select"}>
                              <Form.Select className="form-control alert alert-secondary">
                                <option value="0" hidden>Select slot for {selectedDay.day}</option>
                                { this.state.slots.map((slot) => (
                                    <option value={slot.slotid}>{slot.name} ({moment(slot.starttime).format('h:mm:ss A')} - {moment(slot.endtime).format('h:mm:ss A')})</option>
                                  ) 
                                )}
                              </Form.Select>
                            </Form.Group>
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
          <section className="pricing" id="groupViewSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Groups</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                      <h5 className="text-center">Confirm Group</h5>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>Selected Students</strong></li>
                        </ul>
                        <ul class="list-group selectedbox">
                          {this.state.selectedStudents.map((selectedStudent) => ( 
                            <li class="list-group-item list-group-item-secondary"> 
                                  {selectedStudent.firstname + " " + selectedStudent.lastname + " ("}<strong>{selectedStudent.coursename + " " + selectedStudent.timing + " months"}</strong>{"-" + selectedStudent.accentname + " Accent)"}
                            </li>
                            )
                            )}
                        </ul>
                      </div>
                      <div className="col-lg-5 col-md-5">
                        <ul class="list-group">
                          <li class="list-group-item selectliHead"><strong>Selected Days and Slots</strong></li>
                        </ul>
                        <ul class="list-group selectedbox">
                          {this.state.selectedSlots.map((selectedSlot) => ( 
                            <li class="list-group-item list-group-item-secondary"> 
                            {selectedSlot.day.day} {selectedSlot.slot.name} ({moment(selectedSlot.slot.starttime).format('h:mm:ss A')} - {moment(selectedSlot.slot.endtime).format('h:mm:ss A')})
                            </li>
                            )
                            )}
                        </ul>
                      </div>
                    </div>
                    <div className="btn-wrap-next">
                      <button type="button" className="btn-buy button-Next" onClick={this.groupViewBackClicked}>Back</button>
                      <button type="submit" className="btn-buy button-Next" onClick={this.hitGroupCreationApi}>Confirm</button>
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
