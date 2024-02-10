import React from 'react';
import { MenuItems } from "./MenuItems";
import { LoggedinMenuItems } from "./LoggedinMenuItems";
import './Navbar.css'
import { Link, NavLink } from 'react-router-dom';

class Navbar extends React.Component{
	
	state = { clicked: false}
	handleClick = () => {
		this.setState({clicked: !this.state.clicked})
	}

	handlLinkCLick = () => {
		if(this.state.clicked){
			this.handleClick()
		}
	}



	render(){
		return(
			<nav className="NarbarItems">
				<Link to="/"><img className="navbar-logo" src="/Images/logo.png" alt="On Lang"/></Link>
				<div className="menu-icon" onClick={this.handleClick}>
					<i className={this.state.clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
				</div>
				<ul className={this.state.clicked ? 'nav-menu active' : 'nav-menu'}>
					{ this.props.token ? 
						LoggedinMenuItems.map((item, index) => {
							return(
								<li key={index}>
									<NavLink className={item.cName} to={item.url} activeClassName="active" onClick={this.handlLinkCLick}>{item.title}</NavLink>
								</li>
							)
						})
					 	:
						MenuItems.map((item, index) => {
							return(
								<li key={index}>
									<NavLink className={item.cName} to={item.url} activeClassName="active" onClick={this.handlLinkCLick}>{item.title}</NavLink>
								</li>
							)
						})
					}
					{ this.props.token ? null :
						<div className="dropdown">
	    					<a className="dropdown-toggle nav-links" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	    					New Registration
	    					</a>
						    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						        <NavLink className="dropdown-item dropdown-links" to="/institutionSignup">
						        <i className="fa fa-university" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Institution</NavLink>
						        <NavLink className="dropdown-item dropdown-links" to="/teacherSignup">
						        <i className="fas fa-chalkboard-teacher"></i>&nbsp;&nbsp;Teacher</NavLink>
						    </div>
						</div>
					}
				</ul>
			</nav>
		);
	}
}

export default Navbar