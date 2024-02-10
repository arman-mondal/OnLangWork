import React from 'react';
import {Form, Card} from "react-bootstrap";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import axios from 'axios';
import configData from "../../config.json";

export default class InviteTeacher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter : 1,
      items : [{
        email : "email_0"
      }],
      selected: [{ email : ""}]
    }
  }

  componentDidMount () {
    document.getElementById("loader").style.display = "none";
  }

  addNewRow = (e) => {
    var localItem = this.state.items
    var newEmail = "email_" + this.state.counter;
    var newCounter = this.state.counter + 1;
    localItem.push({
      email : newEmail
    }); 
    var selectedPre = this.state.selected;
    selectedPre.push({
      email : ""
    })
    this.setState({
        items: localItem,
        counter : newCounter,
        selected : selectedPre
    });  
  }

  removeRow = (e) => {
    if(this.state.counter > 1){
      var localItem = this.state.items
      var selectedPre = this.state.selected;
      var newCounter = this.state.counter - 1;
      localItem.pop();
      selectedPre.pop();
      this.setState({
          items: localItem,
          counter : newCounter,
          selected : selectedPre
      });  
    }
  }


  selectChange = (e) => {
    var current = e.currentTarget.id.split("_");
    var selectedPre = this.state.selected;
    selectedPre[current[1]].email = e.currentTarget.value;
    this.setState({
        selected : selectedPre
    });  
  }


  inviteTeacher = (e) => {
    var flag = true;
    for (var i = 0; i < this.state.selected.length; i++) {
      if(this.state.selected[i].email == ""){
        swal({
          title: "Invite Teacher",
          text: "Please enter the emails of all your teachers",
          icon: "warning",
          button: "ok",
        });
        return;
      }
      for (var j = i + 1; j < this.state.selected.length; j++) {
         if(this.state.selected[i].email == this.state.selected[j].email){
            swal({
              title: "Invite Teacher",
              text: "Duplicated emails are not allowed",
              icon: "warning",
              button: "ok",
            });
            return;
         }
      }
    }
    document.getElementById("loader").style.display = "block";
    console.log(this.state.selected);
    const savedToken = localStorage.getItem('loginToken');
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('data', JSON.stringify(this.state.selected));
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'teachers/inviteTeacher',
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
              title: "Invite Teacher",
              text: "your teacher will receive a registration email shortly",
              icon: "success",
              button: "ok",
            }).then(function(){
              window.location.href = '/home'
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
          <section className="pricing">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Invite Teachers</h3>

                    <div className="align-right mb-3">
                      <button type="button" className="btn-buy button-Next" onClick=""><i className="fas fa-file-excel"></i> Upload</button>
                    </div>
                    <div className="div-scroll-y-invite"> 
                      {this.state.items.map((item,key) => ( 
                        <div className="row">
                          <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                            <Form.Group className="mb-3" controlId={item.email}>
                              <Form.Control type="email" placeholder="Teacher Email" required="true" onChange={this.selectChange}/>
                            </Form.Group>
                          </div>
                        </div>
                        )
                      )}
                    </div>
                    <div className="align-left">
                      <button type="button" className="btn-buy button-Next" onClick={this.addNewRow}><i className="fas fa-plus"></i> Add Teacher</button>
                      <button type="button" className="btn-buy button-Next" onClick={this.removeRow}><i class="far fa-trash-alt"></i> Remove Teacher</button>
                    </div>

                  </Card>
                  <div className="btn-wrap-next m-2">

                    <a href="/inviteTeachers" className="btn-buy" id="backBtnId">Clear Form</a>
                    <button type="submit" className="btn-buy button-Next" onClick={this.inviteTeacher}>Invite</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </header>
      </div>
    )
  }
}