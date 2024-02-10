import './agenda.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import {Form, Button, Card, Row, Alert, Badge} from "react-bootstrap";
import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  WeekView,
  Toolbar,
  DateNavigator,
  Appointments,
  TodayButton,
} from '@devexpress/dx-react-scheduler-material-ui';

import { appointments } from '../class/demo-data/appointments';
import { blueGrey, deepOrange, pink, red, teal } from '@mui/material/colors';

export default class Timetable extends React.Component{
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
        classes : [],
        data: appointments,
        currentDate: `${today.getFullYear()}-${today.getMonth() + 1 }-${today.getDate()}`,
        startingHour : 0,
        endingHour : 24,
        mainResourceName: 'colorId',
        resources: [],
    };
    this.currentDateChange = (currentDate) => { 
        this.setState({ currentDate });
        this.getClasses(this.props.user[0].teacherid,currentDate) 
    };
  }
  componentDidMount () {
    if(this.props.token){
      window.location =  configData.SERVER_URL
    }
    const today = new Date();
    this.getClasses(this.props.user[0].teacherid,today)
    document.getElementById("loader").style.display = "none";
  }

  getClasses(teacherid,date){
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('teacherid', teacherid);
     axios({
      method: "post",
      url:  configData.SERVER_URL + 'classes/getTeacherTimetable',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(resp => {
        if(resp.data.code === 200){
            console.log(resp.data)
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
            let classdate = this.datedifference(date, myclass.dayid)
            classes.push({
              title: `${myclass.coursename} ${myclass.noofstudents} students`,
              startDate: new Date(classdate.getFullYear(), classdate.getMonth(), classdate.getDate(), starttime.getHours(), starttime.getMinutes()),
              endDate: new Date(classdate.getFullYear(), classdate.getMonth(), classdate.getDate(), endtime.getHours(), endtime.getMinutes()),
              id: myclass.classid,
              colorId : myclass.packageid
            })
            colors.push({
              id: myclass.packageid, text: `${myclass.coursename} ${myclass.timing} Months` , color : myclass.packagecolor
            })
          });
          console.log(new Date(endingHour).getHours())
          console.log(classes)
          this.setState({
            classes : classes,
            startingHour : new Date(startingHour).getHours(),
            endingHour : new Date(endingHour).getHours() + 1 ,
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
              title: "No Class found",
              text: "You dont have any class",
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

  startOfWeek(date){
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }
  datedifference(date,dayNum){
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1) + (dayNum - 1);
    console.log(diff)
    return new Date(date.setDate(diff));
  }


  render() {
    const { classes, currentDate, startingHour, endingHour, mainResourceName, resources } = this.state;
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
                    <h3>Teachers Timetable</h3>
                    <div className="row d-flex align-items-center justify-content-center">
                        <Paper>
                            <Scheduler
                            data={classes}
                            height={660}
                            >
                            <ViewState
                                currentDate={currentDate}
                                onCurrentDateChange={this.currentDateChange}
                            />
                            <WeekView
                                startDayHour={startingHour}
                                endDayHour={endingHour}
                            />
                            <Toolbar />
                            <DateNavigator />
                            <TodayButton />
                            <Appointments />
                            <Resources
                                data={resources}
                                mainResourceName={mainResourceName}
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
