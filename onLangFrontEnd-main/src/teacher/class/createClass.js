import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import { v1 as uuid } from "uuid";
import {Card,Table} from "react-bootstrap";
import moment from "moment";
import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  DayView,
  Toolbar,
  DateNavigator,
  Appointments,
  TodayButton,
  AppointmentTooltip
} from '@devexpress/dx-react-scheduler-material-ui';

const AppointmentTooltipHeader = (({children, appointmentData, ...restProps}) => {
    localStorage.setItem("classid",appointmentData.id)
    let myAppointment = Object.assign({},appointmentData)
    myAppointment.title = myAppointment.title.slice(0, -27)
    console.log(myAppointment)
    return (
    <AppointmentTooltip.Header
      {...restProps}   
      appointmentData={myAppointment}
      onOpenButtonClick={{}}
    >
      <button className="mt-2 p-2 btn btn-warning" onClick={(appointmentData) => {
        console.log(appointmentData)
        const id = uuid();
        var bodyFormData = new URLSearchParams();
        bodyFormData.append('classid', localStorage.getItem("classid"));
        bodyFormData.append('uuid', id);
        bodyFormData.append('teacherid', localStorage.getItem("teacherid"));
         axios({
          method: "post",
          url:  configData.SERVER_URL + 'classes/createliveclass',
          data: bodyFormData,
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }).then(resp => {
            console.log(resp.data)
            if(resp.data.code == 200){
              window.location.href = `/room/${id}/${localStorage.getItem("classid")}`;
            }else{
              if(resp.data.code == 201){
                window.location.href = `/room/${resp.data.uuid}/${localStorage.getItem("classid")}`;
              }else{
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
      }}>Start Class</button>
    </AppointmentTooltip.Header>
    )
});

export default class CreateClass extends React.Component{
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      classes : [],
      teacher : "",
      currentDate: `${today.getFullYear()}-${today.getMonth() + 1 }-${today.getDate()}`,
      startingHour : 0,
      endingHour : 24,
      mainResourceName: 'colorId',
      resources : []
    };
    localStorage.setItem("teacherid",this.props.user[0].teacherid)

    this.currentDateChange = (currentDate) => { 
      this.setState({ currentDate }); 
      this.getClasses(this.props.user[0].teacherid,currentDate)
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    this.setState({
      teacher : this.props.user[0]
    })
    const today = new Date();
    this.getClasses(this.props.user[0].teacherid,today)
    document.getElementById("loader").style.display = "none";
  }

  getClasses(teacherid,date){
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('teacherid', teacherid);
    bodyFormData.append('dayid', date.getDay());
     axios({
      method: "post",
      url:  configData.SERVER_URL + 'classes/getTeacherClasses',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code === 200){
          let startingHour = new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} 23:59`).getTime()
          let endingHour = new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} 00:00`).getTime()
          let classes = []
          let colors = []
          resp.data.classes.forEach(myclass => {
            let starttime = new Date(myclass.starttime)
            let endtime = new Date(myclass.endtime)
            if(new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} ${starttime.getHours()}:${starttime.getMinutes()}:00`).getTime() < startingHour){
              startingHour = new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} ${starttime.getHours()}:${starttime.getMinutes()}:00`).getTime()
            }
            if(new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} ${endtime.getHours()}:${endtime.getMinutes()}:00`).getTime() > endingHour){
              endingHour = new Date(`${date.getFullYear()}-${date.getMonth()+ 1}-${date.getDate()} ${endtime.getHours()}:${endtime.getMinutes()}:00`).getTime()
            }
            classes.push({
              title: `${myclass.coursename} ${myclass.timing} Months ${myclass.noofstudents} students`,
              startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), starttime.getHours(), starttime.getMinutes()),
              endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), endtime.getHours(), endtime.getMinutes()),
              id: myclass.classid,
              colorId : myclass.packageid
            })
            colors.push({
              id: myclass.packageid, text: `${myclass.coursename} ${myclass.timing} Months` , color : myclass.packagecolor
            })
          });
          this.setState({
            classes : classes,
            startingHour : new Date(startingHour).getHours(),
            endingHour : new Date(endingHour).getHours() == new Date(startingHour).getHours() ? new Date(endingHour).getHours() + 1 : new Date(endingHour).getHours(),
            resources : [
                {
                  fieldName: 'colorId',
                  title: 'Colors',
                  instances: colors
                }
              ]
          });
        }else{
          if(resp.data.code === 201){
            swal({
              title: "No Class Today",
              text: "You dont have any class today",
              icon: "success",
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

  startClass = (classid) => {
    const id = uuid();
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('classid', classid);
    bodyFormData.append('uuid', id);
    bodyFormData.append('teacherid', this.state.teacher.teacherid);
     axios({
      method: "post",
      url:  configData.SERVER_URL + 'classes/createliveclass',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code == 200){
          window.location.href = `/room/${id}/${classid}`;
        }else{
          if(resp.data.code == 201){
            window.location.href = `/room/${resp.data.uuid}/${classid}`;
          }else{
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
          <section className="pricing" id="slotViewSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Live Classes Today (click on the banner of the class to start)</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                        <Paper>
                          <Scheduler data={this.state.classes} height={660}>
                            <ViewState currentDate={this.state.currentDate} onCurrentDateChange={this.currentDateChange}/>
                            <DayView startDayHour={this.state.startingHour} endDayHour={this.state.endingHour}/>
                            <Toolbar />
                            <DateNavigator />
                            <TodayButton />
                            <Appointments/>
                            <AppointmentTooltip 
                              showCloseButton={true} 
                              headerComponent={AppointmentTooltipHeader}
                              />
                            <Resources
                                data={this.state.resources}
                                mainResourceName={this.state.mainResourceName}
                                />
                          </Scheduler>
                        </Paper>
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
