import React from 'react';

export default class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.props.userLogout();
  	localStorage.setItem('loginToken', 0);
  	window.location.href = "/home";
  }

}