import React from 'react';
import './footer.css'
import {Container} from "react-bootstrap";

class Footer extends React.Component{

	render(){
		return(
			<footer>
				<Container>
				  <div className="row my-4">
				    <div className="col-sm">
				    	<img className="footer-logo" src="/Images/logo.png" alt="On Lang"/>
				    	<p className="col-address">info@onlang.net</p>
				    	<p className="col-address">+44 (0)7971 560 455</p>
				    	<p className="col-address">90a High Street, Berkhamsted<br />
				    	HERTFORDSHIRE HP4 2BL<br />
				    	United Kingdom</p>
				    </div>
				    <div className="col-sm mt-4">
				    	<h4>Useful Links</h4>
				    	<ul>
				    		<li className="mb-2"><a href="/">About Us</a></li>
				    		<li className="mb-2"><a href="/">User Guide</a></li>
				    		<li className="mb-2"><a href="/">Contact Us</a></li>
				    		<li className="mb-2"><a href="/privacypolicy">Privacy Policy</a></li>
				    		<li className="mb-2"><a href="/termsandconditions">Terms and Conditions</a></li>
				    	</ul>
				    </div>
				    <div className="col-sm mt-4">
				    	<h5>Join Our Newsletter Now</h5>
				    	<p>Get E-mail updates about our latest shop and special offers.</p>
				    	<form className="new-letter-form">
				    		<input className="" placeholder="Enter your Email"/>
				    		<button type="submit">Subscribe</button>
				    	</form>
				    	<div>
				    		<a href="https://www.instagram.com/" className="social-a"><i className="fab fa-instagram"></i></a>
				    		<a href="https://www.facebook.com/" className="social-a"><i className="fab fa-facebook"></i></a>
				    		<a href="https://www.linkedin.com/" className="social-a"><i className="fab fa-linkedin"></i></a>
				    		<a href="https://www.twitter.com/" className="social-a"><i className="fab fa-twitter"></i></a>
				    		<a href="https://www.snapchat.com/" className="social-a"><i className="fab fa-snapchat"></i></a>
				    		<a href="https://github.com/" className="social-a"><i className="fab fa-github"></i></a>
				    		<a href="https://stackoverflow.com/" className="social-a"><i className="fab fa-stack-overflow"></i></a>
				    	</div>
				    </div>
				  </div>
				  <hr />
				  <div className="row">
				    <div className="col-sm">
				    	<p className="col-address">Copyright ©{new Date().getFullYear()} All rights reserved by On Lang</p>
				    </div>
				    <div className="col-sm">
				    	<img className="footer-logo float-end pr" src="/Images/cards.png" alt="On Lang"/>
				    </div>
				  </div>
				</Container>
			</footer>
		);
	}
}

export default Footer