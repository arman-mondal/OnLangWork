import React from 'react';
import './SideMenu.css'
import configData from "../../config.json";

export default class InstitutionSideMenu extends React.Component{
	
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
								<img className="round" src={ configData.SERVER_URL_ASSETS + this.props.user[0].collegelogo}  width="80px" height="80px"/>
								<br />
								<a className="home-anchor" href="/dashboard">
									<strong>Welcome, {this.props.user[0].collegename}</strong>
								</a>
						</div>
						: null
					}
						<li>
							<a href="">
								<i className="far fa-users"></i>
								<strong>Groups</strong>
							</a>
							<ul>
									<li><a href="/inviteStudents"><i className="fas fa-external-link"></i>Invite Students</a></li>
								<li><a href="/creategroup"><i className="far fa-users"></i>Create Group</a></li>
								<li><a href="/grouplist"><i className="fas fa-list"></i>Groups List</a></li>
								<li><a href="/studentlist"><i className="fas fa-list"></i>Students List</a></li>

							</ul>
						</li>
						<li>
							<a href="">
								<i className="far fa-chalkboard-teacher"></i>
								<strong>Teachers</strong>
							</a>
							<ul>
								<li><a href="/inviteTeachers"><i className="fas fa-external-link"></i>Invite Teachers</a></li>
								<li><a href="/teacherList"><i className="fas fa-list"></i>Teachers List</a></li>
							</ul>
						</li>
					
						{/* <li>
							<a href="">
								<i className="fa fa-edit"></i>
								<strong>Classes</strong>
							</a>
							<ul>
								<li><a href="/classlist"><i className="fas fa-list"></i>Classes List</a></li>
							</ul>
						</li> */}
						<li>
							<a href="">
								<i className="far fa-users"></i>
								<strong>Subscriptions</strong>
							</a>
							<ul>
								<li><a href="/subscritionslist"><i className="fa fa-rocket"></i>View List</a></li>
								{/* <li><a href="/packages"><i className="far fa-file-alt"></i>Current Packages</a></li> */}
							</ul>
						</li>
						<li>
							<a href="">
								<i className="fas fa-credit-card"></i>
								<strong>Make a Payment</strong>
							</a>
						</li>
						<li>
							<a href="">
								<i className="far fa-file-alt"></i>
								<strong>Student Analytics</strong>
							</a>
							<ul>
								<li><a href="#"><i className="far fa-receipt"></i>Attendence Charts</a></li>
								<li><a href="#"><i className="far fa-receipt"></i>Grades</a></li>
							</ul>
						</li>
						<li>
							<a href="">
								<i className="fas fa-question"></i>
								<strong>Contact</strong>
							</a>
							<ul>
								<li><a href="/college/contactus"><i className="fas fa-info-circle"></i>Contact On Lang</a></li>
							</ul>
						</li>
						<li>
							<a href="">
								<i className="far fa-user"></i>
								<strong>Account</strong>
							</a>
							<ul>
								<li><a href="/institutionprofile"><i className="far fa-user-circle"></i>View Info</a></li>
								<li><a href="/packages"><i className="far fa-file-alt"></i>Quotes</a></li>
								<li><a href="/invoices"><i className="fal fa-receipt"></i>Invoices</a></li>
							</ul>
						</li>
					</ul>
				</nav>
		);
	}
}