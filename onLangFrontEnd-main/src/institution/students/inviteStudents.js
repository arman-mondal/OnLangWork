import React from 'react';
import {Form, Card} from "react-bootstrap";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import axios from 'axios';
import configData from "../../config.json";
import * as XLSX from 'xlsx';

export default class InviteStudent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter : 1,
      items : [{
        email : "email_0",
        package : "package_0",
        value: ""
      }],
      packages : [],
      selected: [{ email : "", package : "0"}],
      selectedFile: ''
    }
  }

  componentDidMount () {
    const savedToken = localStorage.getItem('loginToken');
    axios({
        method: "get",
        url: configData.SERVER_URL + 'packages/subscribed/',
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "authtoken" : savedToken
        },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){
            this.setState({
              packages : resp.data.packages
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

  addNewRow = (e) => {
    var remainSLots = 0;
    var packages = this.state.packages;
    for (var i = 0; i < packages.length; i++) {
        remainSLots += packages[i].avaliableslots;
    }
    if(remainSLots > 0){
      var localItem = this.state.items
      var newEmail = "email_" + this.state.counter;
      var newPackage = "package_" + this.state.counter;
      var newCounter = this.state.counter + 1;
      localItem.push({
        email : newEmail,
        package : newPackage,
        value : ""
      }); 
      var selectedPre = this.state.selected;
      selectedPre.push({
        email : "",
        package : "0"
      })
      this.setState({
          items: localItem,
          counter : newCounter,
          selected : selectedPre
      });  
    }else{
      swal({
        title: "Warning!",
        text: "All slots are full",
        icon: "warning",
        button: "ok",
      });    
    }
  }

  removeRow = (e) => {
    if(this.state.counter > 1){
      var localItem = this.state.items
      var packages = this.state.packages;
      var selectedPre = this.state.selected;
      var newCounter = this.state.counter - 1;
      for (var i = 0; i < packages.length; i++) {
        if(packages[i].subscriptioid == selectedPre[newCounter].package){
          packages[i].avaliableslots = packages[i].avaliableslots + 1;
          if(packages[i].avaliableslots > 0){
            packages[i].optionmenu = false;
          }
        }
      }
      localItem.pop();
      selectedPre.pop();
      this.setState({
          items: localItem,
          counter : newCounter,
          selected : selectedPre,
          packages : packages
      });  
    }
  }

  selectChange = (e) => {
    var current = e.currentTarget.id.split("_");
    var packages = this.state.packages;
    var selectedPre = this.state.selected;
    if(current[0] === "email"){
      selectedPre[current[1]].email = e.currentTarget.value;
    }else{
      if(selectedPre[current[1]].package == "0"){
        for (var i = 0; i < packages.length; i++) {
          if(packages[i].subscriptioid == e.currentTarget.value){
            packages[i].avaliableslots = packages[i].avaliableslots - 1;
            if(packages[i].avaliableslots < 1){
              packages[i].optionmenu = true;
            }
          }
        }
      }else{
        for (var i = 0; i < packages.length; i++) {
          if(packages[i].subscriptioid == e.currentTarget.value){
            packages[i].avaliableslots = packages[i].avaliableslots - 1;
            if(packages[i].avaliableslots < 1){
              packages[i].optionmenu = true;
            }
          }
          if(packages[i].subscriptioid == selectedPre[current[1]].package){
            packages[i].avaliableslots = packages[i].avaliableslots + 1;
            if(packages[i].avaliableslots > 0){
              packages[i].optionmenu = false;
            }
          }
        }
      }
      selectedPre[current[1]].package = e.currentTarget.value;
    }
    this.setState({
        selected : selectedPre,
        packages : packages
    });  
  }

  handleFile = (e) => {
    let selectedFile = e.target.files[0];
    if(selectedFile){
      console.log(selectedFile.type)
      let reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onload=(e)=>{
        console.log(e.target.result);
        this.setState({
            selectedFile: e.target.result
        });  
      }
    }else{
      console.log("Please select Your File")
    }
  }

  handleUpload = (e) => {
    e.preventDefault();
    if(this.state.selectedFile!== null){
      const workbook = XLSX.read(this.state.selectedFile,{type:'buffer'});
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log(data);
      var localItem = [];
      var selectedPre = [];
      data.forEach(function (element, i) {
        var newEmail = "email_" + i;
        var newPackage = "package_" + i;
        localItem.push({
          email : newEmail,
          package : newPackage,
          value: element.emails
        });  
        selectedPre.push({
          email : element.emails,
          package : "0"
        }) 
      });
      this.setState({
          items: localItem,
          counter : data.length,
          selected : selectedPre
      }); 

    }else{
      swal({
        title: "Warning!",
        text: "Please select a file first",
        icon: "warning",
        button: "ok",
      });
    }
  }

  inviteStudent = (e) => {
    var flag = true;
    for (var i = 0; i < this.state.selected.length; i++) {
      if(this.state.selected[i].email == ""){
        swal({
          title: "Invite Students",
          text: "Please enter the emails of all the students",
          icon: "warning",
          button: "ok",
        });
        return;
      }
      if(this.state.selected[i].package == "0"){
        swal({
          title: "Invite Students",
          text: "Please select a package for all the students",
          icon: "warning",
          button: "ok",
        });
        return;
      }
      for (var j = i + 1; j < this.state.selected.length; j++) {
         if(this.state.selected[i].email == this.state.selected[j].email){
            swal({
              title: "Invite Students",
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
        url: configData.SERVER_URL + 'students/invite',
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
              title: "Invite Students",
              text: "An invitation link has been sent",
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
                    <h3>Invite Students</h3>

                    <div className="align-right">
                      <input type="file" onChange={this.handleFile}  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                      <button type="button" className="btn-buy button-Next" onClick={this.handleUpload}><i className="fas fa-file-excel"></i> Upload</button>
                    </div>
                    <hr/>
                    <div className="div-scroll-y-invite">
                      {this.state.items.map((item,key) => ( 
                        <div className="row">
                          <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                            <Form.Group className="mb-3" controlId={item.email}>
                              <Form.Control type="email" placeholder="Student Email" onChange={this.selectChange} defaultValue={item.value}/>
                            </Form.Group>
                          </div>
                          <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                            <Form.Group className="mb-3" controlId={item.package}>
                              <Form.Select onChange={this.selectChange}>
                                <option value="0" hidden>Select package</option>
                                { this.state.packages.map((item,key) => (
                                    item.optionmenu ?
                                    <option value={item.subscriptioid} disabled>{item.coursename} {item.timing} Months (remaining slots {item.avaliableslots})</option>
                                    :
                                    <option value={item.subscriptioid}>{item.coursename} {item.timing} Months (remaining slots {item.avaliableslots})</option>
                                  ) 
                                )}
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </div>
                        )
                      )}
                    </div>

                    <div className="align-left">
                      <button type="button" className="btn-buy button-Next" onClick={this.addNewRow}><i className="fas fa-plus"></i> Add Student</button>
                      <button type="button" className="btn-buy button-Next" onClick={this.removeRow}><i class="far fa-trash-alt"></i> Remove Student</button>
                    </div>

                  </Card>
                  <div className="btn-wrap-next m-2">
                    <a href="/inviteStudents" className="btn-buy" id="backBtnId">Clear Form</a>
                    <button type="submit" className="btn-buy button-Next" onClick={this.inviteStudent}>Invite</button>
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