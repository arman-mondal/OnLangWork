import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/css/bootstrap.min.css"; 
import "@popperjs/core"; 
import "bootstrap";
import Navbar from "./components/Navbar/Navbar";
import InstitutionSideMenu from "./components/Sidemenu/InstitutionSideMenu";
import StudentSideMenu from "./components/Sidemenu/StudentSideMenu";
import TeacherSideMenu from "./components/Sidemenu/TeacherSideMenu";
import Footer from "./components/Footer/footer";

import Home from './staticPages/home';
import About from './staticPages/about';
import Courses from './staticPages/courses';
import Software from './staticPages/oursoftware';
import PrivacyPolicy from './staticPages/privacypolicy';
import TermsandConditions from './staticPages/termsandconditions';

import Contact from './contact/contactus';
import Login from './profiling/login';
import Logout from './profiling/logout';
import InstitutionSignup from './profiling/institutionSignup';
import TeacherSignup from './profiling/teacherSignup';

//****************** Intitution Classes Imports ***************//
import InstitutionProfile from './institution/account/profile';
import InviteStudent from './institution/students/inviteStudents';
import StudentList from './institution/students/studentList';
import StudentDetails from './institution/students/studentDetails';
import InviteTeacher from './institution/teacher/inviteTeachers';
import TeacherList from './institution/teacher/teacherList';
import TeacherDetails from './institution/teacher/teacherDetails';
import StudentForm from './institution/students/studentform';
import TeacherForm from './institution/teacher/teacherform';
import Dashboard from './institution/dashboard';
import CreateGroup from './institution/groups/createGroups';
import GroupList from './institution/groups/groupsList';
import GroupDetails from './institution/groups/groupDetails';
import SubscritionsList from './institution/subscriptions/subscriptions';
import SubscritionDetails from './institution/subscriptions/subscriptiondetails';
import Packages from './institution/subscriptions/packages';
import InvoicesList from './institution/subscriptions/invoices';
import InvoiceDetails from './institution/subscriptions/invoicedetails';
import ClassDetails from './institution/class/classdetails';
import LiveClassDetails from './institution/class/liveclassdetails';
import ClassList from './institution/class/classlist';
import CollegeContactUs from './institution/contact/contactus';

//****************** Teacher Classes Imports ***************//
import CreateClass from './teacher/class/createClass';
import OnlineClass from './teacher/class/onlineClass';
import CreateRoom from "./teacher/class/CreateRoom";
import Room from "./teacher/class/Room"
import Agenda from "./teacher/agenda/agenda"
import CreateAgenda from "./teacher/agenda/createAgenda"
import UpdateAgenda from "./teacher/agenda/updateAgenda"
import TeacherClassList from './teacher/class/classeslist'
import TeacherGroupList from './teacher/groups/grouplist'
import TeacherCoursesList from './teacher/courses/courseslist'
import TeacherProfile from './teacher/profile/profile'
import CourseDetails from './teacher/courses/coursedetails'
import TeacherClassDetails from './teacher/class/teacherclassdetails';
import TeacherGroupDetails from './teacher/groups/teachergroupdetails';
import LessonPlan from './teacher/courses/lessonplan'
import LessonPlanDetails from './teacher/courses/lessonplandetails'
import TeacherCoursesListForLessonPlan from './teacher/library/coursesslection';
import TeacherRecordingsCourseSelection from './teacher/library/courseselectionrecordings';
import TeacherClassesRecordings from './teacher/library/courseclasses';
import TeacherLiveClassesRecordings from './teacher/library/coursesliveclasses';
import Timetable from './teacher/agenda/timetable';
import TeacherContactUs from './teacher/contact/contactus';
import CreateAssignment from './teacher/assigment/createassignment';
import Assignments from './teacher/assigment/assignments';
import UpdateAssignment from './teacher/assigment/updateassignment';
import TeacherAvaliableClasses from './teacher/class/avaliableclasses';

//****************** Student Classes Imports ***************//
import StudentClasses from './student/class/studentClasses';
import StudentRoom from "./student/class/studentRoom"
import StudentLessonPlan from "./student/library/lessons"
import StudentLessonPlanDetails from "./student/library/studentlessondetails"
import StudentContactUs from './student/contact/contactus';
import StudentTimetable from './student/agenda/timetable';
import StudentAssignments from './student/assignment/assignments';
import StudentAssignmentDetails from './student/assignment/assigmentdetails';


import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import configData from "./config.json";
import Demo from './teacher/class/demo';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token : 0,
      user : "",
      userType : 0,
      userName : ""
    };
  }


  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url: configData.SERVER_URL + 'home',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
        },
      }).then(resp => {
          console.log(resp.data);
          if(resp.data.code === 200){
            var name = "";
            if(resp.data.type == 1){
              name = resp.data.user[0].collegename;
            }
            if(resp.data.type == 2 || resp.data.type == 3){
              name = resp.data.user[0].firstname + " " + resp.data.user[0].lastname;
            }
            this.setState({ 
              token : savedToken,
              userType : resp.data.type,
              user : resp.data.user,
              userName : name
            });
          }
        })
      .catch(err => {
          console.log(err)
      })
  }

  updateToken = (newToken) => {
    this.setState({ token: newToken });
  }

  userLogout = () => {
    this.state = {
      token : 0,
      user : "",
      userType : 0,
      userName : ""
    };
  }

  render() {
    return (
      <>
      <Router>
        { this.state.token ? 
          <>
          { window.location.pathname.split('/')[1] == "room" || window.location.pathname.split('/')[1] == "studentroom" ?
            <div className="row">
              <div className="col-12">
                <Switch>
                    <Route path="/room/:roomID/:classid" render={(routeProps) => (<Room user={this.state.user[0]} {...routeProps}/>)} />
                    <Route path="/studentroom/:roomID/:classid" render={(routeProps) => (<StudentRoom user={this.state.user[0]} {...routeProps}/> )} />
                </Switch>
              </div>
            </div>
            :
            <>
            <Navbar token = {this.state.token}/>
            <div className="row bgImage">
              <div className="col-2">
                {this.state.userType == 1 ?
                  <InstitutionSideMenu user = {this.state.user} />
                  :
                  this.state.userType == 2 ?
                    <StudentSideMenu  user = {this.state.user}/>
                    :
                    <TeacherSideMenu  user = {this.state.user}/>
                }
              </div>
              <div className="col-10">
                <Switch>
                  <Route path='/' exact component={Home}/>
                  <Route path='/home' exact component={Home}/>
                  <Route path='/about' exact component={About}/>
                  <Route path='/courses' exact component={Courses}/>
                  <Route path='/oursoftware' exact component={Software}/>
                  <Route path='/contact' exact component={Contact}/>
                  <Route path='/privacypolicy' component={PrivacyPolicy}/>
                  <Route path='/termsandconditions' component={TermsandConditions}/>
                  <Route path='/creategroup' render={(routeProps) => (<CreateGroup userLogout={this.userLogout} {...routeProps}/>)} />
                  <Route path='/institutionprofile' exact component={InstitutionProfile}/>
                  <Route path='/teacherprofile' exact component={TeacherProfile}/>
                  <Route path='/grouplist' component={GroupList}/>
                  <Route path='/teachergrouplist' component={TeacherGroupList}/>
                  <Route path='/subscritionslist' component={SubscritionsList}/>
                  <Route path='/subscritiondetails/:subscriptionid' component={SubscritionDetails}/>
                  <Route path='/packages' component={Packages}/>
                  <Route path='/invoices' component={InvoicesList}/>
                  <Route path='/invoicedetails/:invoiceid' component={InvoiceDetails}/>
                  <Route path='/groupdetails/:groupid' component={GroupDetails}/>
                  <Route path='/createclass' render={(routeProps) => (<CreateClass user={this.state.user} {...routeProps}/>)} />
                  <Route path='/studentclasses' render={(routeProps) => (<StudentClasses user={this.state.user} {...routeProps}/>)} />
                  <Route path='/logout' render={(routeProps) => (<Logout userLogout={this.userLogout} {...routeProps}/>)} />
                  <Route path='/dashboard' render={(routeProps) => (<Dashboard userName={this.state.userName} {...routeProps}/>)} />
                  <Route path='/inviteStudents' component={InviteStudent}/>
                  <Route path='/studentlist' component={StudentList}/>
                  <Route path='/studentdetails/:studentid' component={StudentDetails}/>
                  <Route path='/inviteTeachers' component={InviteTeacher}/>
                  <Route path='/teacherList' component={TeacherList}/>
                  <Route path='/teacherdetails/:teacherId' component={TeacherDetails}/>
                  <Route path="/createroom" exact component={CreateRoom} />
                  <Route path="/agenda" component={Agenda} />
                  <Route path="/createagenda" component={CreateAgenda} />
                  <Route path="/updateagenda" component={UpdateAgenda} />
                  <Route path="/classlist" component={ClassList} />
                  <Route path="/classdetails/:classid" component={ClassDetails} />
                  <Route path="/teacherclasslist" component={TeacherClassList} />
                  <Route path="/liveclassdetails/:liveclassid" component={LiveClassDetails} />
                  <Route path="/teachercorseslist" component={TeacherCoursesList} />
                  <Route path="/coursedetails/:courseid" component={CourseDetails} />
                  <Route path="/teacherclassdetails/:classid" component={TeacherClassDetails} />
                  <Route path='/teachergroupdetails/:groupid' component={TeacherGroupDetails}/>
                  <Route path='/lessonplan/:courseid' component={LessonPlan}/>
                  <Route path='/lessonplandetails/:lessonid' component={LessonPlanDetails}/>
                  <Route path='/coursesselection' component={TeacherCoursesListForLessonPlan}/>
                  <Route path='/studentlessonplan' component={StudentLessonPlan}/>
                  <Route path='/studentlessonplandetails/:lessonid' component={StudentLessonPlanDetails}/>
                  <Route path='/teacherrecordingscourseselection/' component={TeacherRecordingsCourseSelection}/>
                  <Route path='/teacherclassesrecordings/:courseid' component={TeacherClassesRecordings}/>
                  <Route path='/teacherclassesliverecordings/:classid' component={TeacherLiveClassesRecordings}/>
                  <Route path='/teacher/timetable' render={(routeProps) => (<Timetable user={this.state.user} {...routeProps}/>)} />
                  <Route path='/teacher/contactus' component={TeacherContactUs}/>
                  <Route path='/student/contactus' component={StudentContactUs}/>
                  <Route path='/college/contactus' component={CollegeContactUs}/>
                  <Route path='/teacheravaliableclasses' render={(routeProps) => (<TeacherAvaliableClasses user={this.state.user} {...routeProps}/>)} />
                  <Route path='/student/timetable' render={(routeProps) => (<StudentTimetable user={this.state.user} {...routeProps}/>)} />
                  <Route path='/demo' component={Demo}/>
                  <Route path='/createassignment' render={(routeProps) => (<CreateAssignment user={this.state.user} {...routeProps}/>)} />
                  <Route path='/assignment' render={(routeProps) => (<Assignments user={this.state.user} {...routeProps}/>)} />
                  <Route path='/updateassignment/:id' render={(routeProps) => (<UpdateAssignment user={this.state.user} {...routeProps}/>)} />
                  <Route path='/studentassignments' render={(routeProps) => (<StudentAssignments user={this.state.user} {...routeProps}/>)} />
                  <Route path='/studentassignmentdetail/:id/:classassignid' render={(routeProps) => (<StudentAssignmentDetails user={this.state.user} {...routeProps}/>)} />
                </Switch>
              </div>
            </div>
            <Footer />
            </>
          }
          </>
          :
          <>
            <Navbar token = {this.state.token}/>
              <div className="row bgImage">
                <div className="col-12">
                  <Switch>
                    <Route path='/' exact component={Home}/>
                    <Route path='/home' exact component={Home}/>
                    <Route path='/about' exact component={About}/>
                    <Route path='/courses' render={(routeProps) => (<InstitutionSignup token={this.state.token} {...routeProps}/>)} />
                    <Route path='/oursoftware' exact component={Software}/>
                    <Route path='/contact' exact component={Contact}/>
                    <Route path='/login' render={(routeProps) => (<Login token={this.state.token} updateToken={this.updateToken} {...routeProps}/>)} />
                    <Route path='/institutionSignup' render={(routeProps) => (<InstitutionSignup token={this.state.token} {...routeProps}/>)} />
                    <Route path='/teacherSignup' render={(routeProps) => (<TeacherSignup token={this.state.token} {...routeProps}/>)} />
                    <Route path='/privacypolicy' component={PrivacyPolicy}/>
                    <Route path='/termsandconditions' component={TermsandConditions}/>
                    <Route path='/studentform/:token' render={(routeProps) => (<StudentForm token={this.state.token} updateToken={this.updateToken} {...routeProps}/>)} />
                    <Route path='/teacherform/:token' render={(routeProps) => (<TeacherForm token={this.state.token} updateToken={this.updateToken} {...routeProps}/>)} />
                  </Switch>
                </div>
              </div>
            <Footer />
          </>
        }
      </Router>
      </>
    );
  }
}
