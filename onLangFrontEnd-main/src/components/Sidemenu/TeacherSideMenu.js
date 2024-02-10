import React from 'react';
import './SideMenu.css'
import configData from "../../config.json";

export default class TeacherSideMenu extends React.Component{
	
  	constructor(props) {
    	super(props);
	}

	state = { clicked: false, hideSHow: false}
	handleClick = () => {
		this.setState({clicked: !this.state.clicked})
	}

	showHideBtn = () => {
		console.log("I am Clicked");
		if(this.state.hideSHow){
			document.getElementById("ulshowHide").style.display = "block";
			document.getElementById("showHideBtn").style.left = "none";
			document.getElementById("showHideBtn").style.animation = "moveFromRight 1s ease-in-out";
			document.getElementById("showHideBtn").style.left = "250px";
			this.setState({
		      hideSHow: false,
		    })
		}else{
			document.getElementById("ulshowHide").style.display = "none";
			document.getElementById("showHideBtn").style.left = "none";
			document.getElementById("showHideBtn").style.animation = "moveFromLeft 1s ease-in-out";
			document.getElementById("showHideBtn").style.left = "5px";
			this.setState({
		      hideSHow: true,
		    })
		}
	}

	render(){
		return(
				<nav className="sideBarLeft">
					<ul className="mcd-menu p-2" id="ulshowHide">
					{
						this.props.user[0] !== undefined ? 
						<div className="center transparent-bg">
								<img className="round" src={ configData.SERVER_URL_ASSETS + this.props.user[0].image}  width="80px" height="80px"/>
								<br />
								<a className="home-anchor" href="/dashboard">
									<strong>Welcome, {this.props.user[0].firstname} {this.props.user[0].lastname}</strong>
								</a>
						</div>
						: null
					}
						<li>
							<a href="">
								<i className="far fa-users"></i>
								<strong>Class</strong>
							</a>
							<ul>
								<li><a href="/createclass"><i className="far fa-users"></i>Go to Live Class</a></li>
								<li><a href="/teacherclasslist"><i className="fas fa-list"></i>My Classes</a></li>
								<li><a href="/teacheravaliableclasses"><i className="fas fa-list"></i>Available Classes</a></li>
							</ul>
						</li>
						<li>
							<a href="/teacher/timetable">
								<i className="fa fa-edit"></i>
								
								<strong>Weekly Agenda</strong>
							</a>
							<ul>
								<li><a href="/agenda"><i className="fas fa-list"></i>My Agenda</a></li>
								{/* <li><a href="/teacher/timetable"><i className="fas fa-list"></i>Timetable</a></li> */}
							</ul>
						</li>
						{/* <li>
							<a href="">
								<i className="far fa-users"></i>
								<strong>My Courses</strong>
							</a>
							<ul>
								<li><a href="/teachercorseslist"><i className="fas fa-list"></i>Current Courses List</a></li>
							</ul>
						</li> */}
						{/* <li>
							<a href="">
								<i className="far fa-users"></i>
								<strong>My Groups</strong>
							</a>
							<ul>
								<li><a href="/teachergrouplist"><i className="fas fa-list"></i>Group List</a></li>
							</ul>
						</li> */}
						<li>
							<a href="">
								<i className="fas fa-book"></i>
								<strong>Library</strong>
							</a>
							<ul>
								<li><a href="/coursesselection"><i className="fas fa-file"></i>Lesson Plan</a></li>
								<li><a href="/teacherrecordingscourseselection"><i className="fas fa-video"></i>Recordings</a></li>
							</ul>
						</li>
						<li>
							<a href="">
								<i className="fas fa-user"></i>
								<strong>Assignment</strong>
							</a>
							<ul>
								<li><a href="/assignment"><i className="fas fa-edit"></i>Assignments</a></li>
								{/* <li><a href="#"><i className="fas fa-inbox"></i>Inbox</a></li> */}
								<li><a href="#"><i className="fas fa-edit"></i>Group Messaging</a></li>
							</ul>
						</li>
						<li>
							<a href="">
								<i className="fas fa-question"></i>
								<strong>Contact</strong>
							</a>
							<ul>
								<li><a href="/teacher/contactus"><i className="fas fa-info-circle"></i>Contact On Lang</a></li>
							</ul>
						</li>
						<li>
							<a href="">
								<i className="far fa-user"></i>
								<strong>Account</strong>
							</a>
							<ul>
								<li><a href="/teacherprofile"><i className="far fa-user-circle"></i>Account Info</a></li>
								<li><a href="#"><i className="fas fa-history"></i>Login Details</a></li>
							</ul>
						</li>
					</ul>
				</nav>
		);
	}
}