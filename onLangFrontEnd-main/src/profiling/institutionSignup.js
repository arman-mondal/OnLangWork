import './profiling.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React, { Component, useRef } from 'react';
import Loader from "react-js-loader";
import { Form, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import swal from 'sweetalert';
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'
import configData from "../config.json";

export default class InstitutionSignup extends React.Component {

  static defaultProps = {
      center: {
        lat: 25.2048,
        lng: 55.2708
      },
      zoom: 13
    };

  constructor(props) {
    super(props);
    this.selectArray = [];
    for (var i = 1; i < 11; i++) {
        this.selectArray.push(i);
    } 
    this.state = {
      nameOfInstitution: "",
      typeOfInstitution: "University",
      noOfPackages: "1",
      startDate: "",
      minDate : "",
      address: "",
      country: "",
      countrycode: "",
      postcode: "",
      typeOfAccent: "Any",
      all: 0,
      reading: 1,
      writing: 1,
      speaking: 1,
      listening: 1,
      firstname: "",
      lastname: "",
      position: "",
      department : "",
      email: "",
      password:"",
      website: "",
      phone: "",
      tel: "",
      items: [],
      teachersData: {},
      selectedCourseData: [],
      selectedTeachers: [],
      selectedCourse: [],
      currentSection: "",
      previousSection: "",
      sectionHistory: [],
      selectedpackage: 0,
      DataisLoaded: false,
      selectArray: this.selectArray,
      gmapsLoaded: false,
      text1st : "1st ",
      text10th: "10th ",
      text20th: "20th ",
      bool1st: 1,
      bool10th: 1,
      bool20th: 1,
      closeBool1st: false,
      closeBool10th: false,
      closeBool20th: false,
      currentMonth: '1',
      availablePackagesMonths: [],     
      accents : [],
      coursesall:[],
      coursename:'',
      pkgprice:0,
      noofclass:0,
      noofstudents:0,
      courseperiods:0,
allpkgs:[],
teachers:[],
teacherwithcourse:[]


      };
      //this.handleRowClick = this.handleRowClick.bind(this);
 }

    componentDidMount() {
        this.initializeCourses(); 
        this.addStaticTeachers();
        this.handleSectionChange("packagesSection", false);
        this.getAllCourses()
        //console.log(this.props.token);
        if(this.props.token !== 0){
          window.location =  configData.SERVER_URL
    }
    axios({
      method: "get",
      url:  configData.SERVER_URL + 'packages/getall',
    }).then(resp => {
        //console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            availablePackagesMonths : resp.data.packages,
          });
        }else{
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
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


    axios({
      method: "get",
      url:  configData.SERVER_URL + 'accent/getall',
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "authtoken" : this.props.match.params.token
      },
    }).then(resp => {
        //console.log(resp.data)
        if(resp.data.code === 200){
          this.setState({
            accents : resp.data.accents
          });
        }else{
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
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
    
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var date = today.getDate();
    if(date >= 14){
      month = month + 1;
      if(date >= 25){
        this.setState({
          closeBool1st: true
        })
      }
    }else{
      if(date <= 14 && date >= 4){
        this.setState({
          closeBool1st: true,
          closeBool10th: true
        })
      }else{
        this.setState({
          closeBool1st: true
        })
      }
    }
    this.setState({
      minDate: year + "-0" + month,
      currentMonth: month
    })
    window.initMap = this.initMap
    const gmapScriptEl = document.createElement(`script`)
    gmapScriptEl.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCbW7sUOtCHtwO_QhbEsp8hjmlDwERkMWE&libraries=places&callback=initMap`
    document.querySelector(`body`).insertAdjacentElement(`beforeend`, gmapScriptEl)
    document.getElementById("loader").style.display = "none";
  }

  initMap = () => {
    this.setState({
      gmapsLoaded: true,
    })
  }

  handleChange = address => {
    this.setState({ address });

  };

  handleSelect = address => {
    this.setState({ address });
    document.getElementById("address").style.border = "1px solid #ced4da";
    document.getElementById("address").style.boxShadow = "";
    geocodeByAddress(address)
      .then(
        results => {
          console.log('Success', results)
          this.setState({
            city : results[0].formatted_address,
          });
          for (var i = 0; i < results[0].address_components.length; i++) {
            var addressType = results[0].address_components[i].types[0];
            if (addressType === "country") {
              this.setState({
                country : results[0].address_components[i].long_name,
                countrycode: results[0].address_components[i].short_name
              });
            }
          }
        });
  }

    handlePriceClick = (e) => {
        e.preventDefault();
      
            this.setState({ selectedpackage: this.state.selectedCourse });

            setTimeout(() => {
                this.handleSectionChange("informationSection");
            }, 200);
        
    }


    handleSectionChange = (selectedSection, fromBackButton = false) => {
        if (!fromBackButton) {
            this.setState((prevState) => ({
                sectionHistory: [...prevState.sectionHistory, prevState.currentSection],
                currentSection: selectedSection,
            }), () => {
                this.updateSectionVisibility(selectedSection);
                this.updateProgressbar(selectedSection);
            });
        } else {
            this.updateSectionVisibility(selectedSection);
            this.updateProgressbar(selectedSection);
        }
    }

    updateSectionVisibility = (selectedSection) => {
        const sections = ["packagesSection", "coursesSection", "teachersSection", "informationSection"];
        sections.forEach((sectionId) => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = sectionId === selectedSection ? "block" : "none";
            }
            
            
        });
    }

    updateProgressbar = (selectedSection) => {
        const sections = ["packages", "courses", "teachers", "information"];
        const selectedProgress = document.getElementById(selectedSection).dataset.progress;

        sections.forEach((sectionId) => {
            const section = document.getElementById(sectionId);
            if (section) {
                if (sectionId === selectedProgress || sections.indexOf(selectedProgress) > sections.indexOf(sectionId)) {
                    section.classList.add("progressactive");
                } else {
                    section.classList.remove("progressactive");
                }
            }
        });
    }

    handleBackButtonClick = () => {
        this.setState((prevState) => {
            const sectionHistory = [...prevState.sectionHistory];
            const previousSection = sectionHistory.pop();
            return {
                sectionHistory,
                currentSection: previousSection || 'pricingSection',  // Default to the first section if history is empty
            };
        }, () => {
            this.handleSectionChange(this.state.currentSection, true);
        });
    }


    /* Packages */

    packageFull = (e) => {
        swal({
            title: "Package Full!",
            text: "We are very sorry currently we are not offering class for this package!",
            icon: "warning",
            button: "ok",
        });
    }

    initializeCourses = () => {
        var bodyFormData = new URLSearchParams();
        bodyFormData.append('packages', "12");

        axios({
            method: "post",
            url: configData.SERVER_URL + 'packages/',
            data: bodyFormData,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }).then(resp => {
            //console.log("API response:", resp.data);
            if (resp.data.code === 200) {
                //console.log("Packages received:", resp.data.packages);
                this.setState({
                    items: resp.data.packages,
                    DataisLoaded: true
                }, () => {
                    //console.log("State updated with items:", this.state.items);
                });
            } else {
                if (resp.data.code === 201) {
                    swal({
                        title: "No Package Found!",
                        text: "We are very sorry currently no package available for your selection!",
                        icon: "warning",
                        button: "ok",
                    });
                } else {
                    swal({
                        title: "Server Error!",
                        text: "Please try again!",
                        icon: "warning",
                        button: "ok",
                    });
                }
            }
        })
            .catch(err => {
                document.getElementById("loader").style.display = "none";
                console.log("API error:", err);
                document.getElementById("packages").style.display = "none";
                swal({
                    title: "Server Error!",
                    text: "Please try again!",
                    icon: "warning",
                    button: "ok",
                });
            })
    }
    
getAllCourses=(e)=>{
  
var courses=[]
var bodyFormData = new URLSearchParams();
axios({
  method: "post",
  url: configData.SERVER_URL + 'packages/',
  data: bodyFormData,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
}).then(resp => {
    document.getElementById("loader").style.display = "none";
   
     this.setState({
      coursesall:resp.data.packages
     })

        //console.log("Filtered Packages:", filteredCourses);
}
       
).catch(err => {
    document.getElementById("loader").style.display = "none";
    console.error("API error:", err);
    this.handleError();
});

}
    getCourses =async (e) => {
        if (this.state.selectedCourse == "") {
            swal({
                title: "No course selected",
                text: "Please select a course",
                icon: "warning",
                button: "ok",
            })
        } else {
            if (e) e.preventDefault();
            document.getElementById("loader").style.display = "block";

            var bodyFormData = new URLSearchParams();
            bodyFormData.append('packages', e ? e.currentTarget.id : '');

           await axios({
                method: "post",
                url: configData.SERVER_URL + 'packages/',
                data: bodyFormData,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }).then(resp => {
                document.getElementById("loader").style.display = "none";

                if (resp.data.code === 200) {

                    //console.log("Selected Courses:", selectedCourses);
                    //console.log("Packages from response:", resp.data.packages);
                   

                    this.setState({
                        // allpkgs: pkgss,
                        DataisLoaded: true
                    });
                    if (e) {
                        this.handleSectionChange("coursesSection");
                    }
                } else {
                    this.handleError(resp.data);
                }
            }).catch(err => {
                document.getElementById("loader").style.display = "none";
                console.error("API error:", err);
                this.handleError();
            });
        }
    }



    handleError = (data) => {
        let title = "Server Error!";
        let text = "Please try again!";

        if (data) {
            if (data.code === 201) {
                title = "No Package Found!";
                text = "We are very sorry currently no package available for your selection!";
            } else {
                title = "Server Error!";
                text = "Please try again!";
            }
        }

        swal({
            title: title,
            text: text,
            icon: "warning",
            button: "ok",
        });
    }


    /* Buy Class Option */

    handleCourseChange = (selectedCourse) => {
   
        this.setState({
          selectedCourse: selectedCourse
        });
  
      
    };

    getTeachers = async () => {
       const { teachersData, selectedCourse } = this.state;
       await this.getAllCourses();
     
       const selectedCourseData = {};
       if (selectedCourse.length <= 0) {
        swal({
         title: "No course selected",
         text: "Please select a course",
         icon: "warning",
         button: "ok",
        })
       } else { 
       
       try {
      const res = await axios.get(configData.SERVER_URL + 'teachers/getall', {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      this.setState({ teachers: res.data.teachers });
       } catch (err) {
      swal({
        title: "Error",
        text: err,
        icon: "warning",
        button: "ok",
      });
       }
       console.log(this.state.selectedCourse);
      const body = new URLSearchParams();
      body.append('selectedCourses', JSON.stringify(this.state.selectedCourse));
      try {
        const res = await axios.post(configData.SERVER_URL + 'teachers/getcourseteacher', body, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log(res.data)
        const fsys = res.data.teachers;
        console.log(fsys)
        this.setState({
          teachers:res.data.teachers
        })
        
        // this.setState({ teacherwithcourse: [].concat(fsys) });
      } catch (err) {
        swal({
          title: "Error",
          text: err,
          icon: "warning",
          button: "ok",
        });
      }
       }
       
       setTimeout(() => {
      document.getElementById("loader").style.display = "none";
      this.handleSectionChange("teachersSection");
       }, 200);
     }
      
    addStaticTeachers() {
        this.setState({
            teachersData: {
                AI: [
                    { id: 1, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 2, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 3, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 4, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 5, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 6, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 7, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 8, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' }
                ],
                TOEFL: [
                    { id: 9, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 10, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 11, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 12, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 13, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 14, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 15, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 16, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' }
                ],
                IELTS: [
                    { id: 17, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 18, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 19, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 20, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 21, name: 'Jane Cook', time: '9:00 - 9:59AM', days: 'Monday, Wednesday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 22, name: 'Michelle Watkins', time: '2:00-2:59PM', days: 'Wednesday, Thursday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 23, name: 'Mike Thomas', time: '12:00-12:59PM', days: 'Tuesday, Friday', dates: 'September 1 - November 28, 2024', country: 'Sweden' },
                    { id: 24, name: 'James Washington', time: '4:00-4:59PM', days: 'Friday, Saturday, Sunday', dates: 'September 1 - November 28, 2024', country: 'Sweden' }
                ]
            }
        });
        
    }

    handleRowClick = (course, teacherId) => (event) => {
        event.preventDefault();
        this.setState((prevState) => {
            const { selectedTeachers } = prevState;
            const courseTeachers = selectedTeachers[course] || [];
            if (courseTeachers.includes(teacherId)) {
                return {
                    selectedTeachers: {
                        ...selectedTeachers,
                        [course]: courseTeachers.filter((id) => id !== teacherId),
                    },
                };
            } else {
                return {
                    selectedTeachers: {
                        ...selectedTeachers,
                        [course]: [teacherId],
                    },
                };
            }
        });
    }


  /* Form handlers */

  handleInputChange = (e) => {
    e.preventDefault();
    document.getElementById(e.currentTarget.id).style.border = "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
    this.setState({
      [e.target.id]: e.target.value
    })
    if(e.target.id === "startDate"){
      var selectToday = new Date(e.target.value);
      var selectMonth = selectToday.getMonth() + 1;
      if(selectMonth !== this.state.currentMonth){
        this.setState({
          closeBool1st: false,
          closeBool10th: false,
          closeBool20th: false
        })
      }else{
        var today = new Date();
        var date = today.getDate();
        if(date >= 14){
          if(date >= 25){
            this.setState({
              closeBool1st: true
            })
          }
        }else{
          if(date <= 14 && date >= 4){
            this.setState({
              closeBool1st: true,
              closeBool10th: true
            })
          }else{
            this.setState({
              closeBool1st: true
            })
          }
        }
      }
    }
  }

  handleCheckboxChange = (e) => {
    e.preventDefault();
    document.getElementById("prepCheck").style.border = "";
    document.getElementById("prepCheck").style.boxShadow = "";
    if(e.target.checked){
      this.setState({
        [e.target.id]: 0
      });
    }else{
      this.setState({
        [e.target.id]: 1
      });
    }
  }

  handleDateCheckboxChange = (e) => {
    e.preventDefault();
    document.getElementById("dateCheck").style.border = "";
    document.getElementById("dateCheck").style.boxShadow = "";
    if(e.target.checked){
      this.setState({
        [e.target.id]: 0
      });
    }else{
      this.setState({
        [e.target.id]: 1
      });
    }
  }

  validateForm = (e) => {
      var flag = true;
    if(this.state.phone === "" || typeof this.state.phone === "undefined"){
      document.getElementById("phone").style.borderColor = "red";
      document.getElementById("phone").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("phone").focus();
      flag = false;
    }
    if(this.state.tel === "" || typeof this.state.tel === "undefined"){
      document.getElementById("tel").style.borderColor = "red";
      document.getElementById("tel").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("tel").focus();
      flag = false;
    }
    if(this.state.email === "" || typeof this.state.email === "undefined"){
      document.getElementById("email").style.borderColor = "red";
      document.getElementById("email").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("email").focus();
      flag = false;
    }
    if(this.state.password === "" || typeof this.state.password === "undefined"){
      document.getElementById("password").style.borderColor = "red";
      document.getElementById("password").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("password").focus();
      flag = false;
    }
    if(this.state.position === "" || typeof this.state.position === "undefined"){
      document.getElementById("position").style.borderColor = "red";
      document.getElementById("position").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("position").focus();
      flag = false;
    }
    if(this.state.lastname === "" || typeof this.state.lastname === "undefined"){
      document.getElementById("lastname").style.borderColor = "red";
      document.getElementById("lastname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("lastname").focus();
      flag = false;
    }
    if(this.state.firstname === "" || typeof this.state.firstname === "undefined"){
      document.getElementById("firstname").style.borderColor = "red";
      document.getElementById("firstname").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("firstname").focus();
      flag = false;
    }
    if(this.state.postcode === "" || typeof this.state.postcode === "undefined"){
      document.getElementById("postcode").style.borderColor = "red";
      document.getElementById("postcode").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("postcode").focus();
      flag = false;
    }
    if(this.state.address === "" || typeof this.state.address === "undefined"){
      document.getElementById("address").style.borderColor = "red";
      document.getElementById("address").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("address").focus();
      flag = false;
    }
    if(this.state.startDate === "" || typeof this.state.startDate === "undefined"){
      document.getElementById("startDate").style.borderColor = "red";
      document.getElementById("startDate").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("startDate").focus();
      flag = false;
    }
    if(this.state.nameOfInstitution === "" || typeof this.state.nameOfInstitution === "undefined"){
      document.getElementById("nameOfInstitution").style.borderColor = "red";
      document.getElementById("nameOfInstitution").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("nameOfInstitution").focus();   
      flag = false;
    }
    if(this.state.bool1st === 1 && this.state.bool10th === 1 && this.state.bool20th === 1){
      document.getElementById("dateCheck").style.borderColor = "red";
      document.getElementById("dateCheck").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
      document.getElementById("dateCheck").focus();   
      flag = false;
    }else{
      if(this.state.bool1st === 1){
        this.state.startDate = this.state.startDate + "-01";
      }else{
        if(this.state.bool10th === 1){
          this.state.startDate = this.state.startDate + "-10";
        }else{
          this.state.startDate = this.state.startDate + "-20";
        }
      }
      //console.log("`notcome");
    }
    // if(this.state.all === 1 && this.state.reading === 1 && this.state.writing === 1 && this.state.speaking === 1 && this.state.listening === 1){
    //   document.getElementById("prepCheck").style.borderColor = "red";
    //   document.getElementById("prepCheck").style.boxShadow = "2px 3px 3px 7px #FFCCCC";
    //   document.getElementById("prepCheck").focus();   
    //   flag = false;
    // }
    if(flag){
      document.getElementById("loader").style.display = "block";
      if(this.state.all === 0){
        this.setState({
          reading : 0,
          writing : 0,
          speaking : 0,
          listening : 0
        })
      }else{
        return;
      }
      console.log(this.state.reading);
      console.log(this.state.writing);
      console.log(this.state.speaking);
      console.log(this.state.listening);
      this.hitRegisterAPI(e);
    }
  }

  async hitRegisterAPI(e){
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('collegename', this.state.nameOfInstitution);
    bodyFormData.append('collegetype', this.state.typeOfInstitution);
    bodyFormData.append('firstname', this.state.firstname);
    bodyFormData.append('lastname', this.state.lastname);
    bodyFormData.append('designation', this.state.position);
    bodyFormData.append('department', this.state.department);
    bodyFormData.append('email', this.state.email);
    bodyFormData.append("password", this.state.password);
    bodyFormData.append('website', this.state.website);
    bodyFormData.append('phone', this.state.phone);
    bodyFormData.append('tel', this.state.tel);
    bodyFormData.append('city', this.state.city);
    bodyFormData.append('postalcode', this.state.postcode);
    bodyFormData.append('country', this.state.country);
    bodyFormData.append('countrycode', this.state.countrycode);
    bodyFormData.append('noofpackages', this.state.noOfPackages);
    bodyFormData.append('startdate', this.state.startDate);
    bodyFormData.append('accent', this.state.typeOfAccent);
    bodyFormData.append('subscription', this.state.selectedpackage);
    bodyFormData.append('reading', this.state.reading);
    bodyFormData.append('writing', this.state.writing);
    bodyFormData.append('speaking', this.state.speaking);
    bodyFormData.append('listening', this.state.listening);
    bodyFormData.append('coursename',this.state.coursename);
    
    bodyFormData.append('noofclass',this.state.noofclass);
    bodyFormData.append('noofstudents',this.state.noofstudents);
    bodyFormData.append('courseperiods',this.state.courseperiods);

   await axios({
        method: "post",
        url:  configData.SERVER_URL + 'register/college',
        data: bodyFormData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }).then(resp => {
          console.log(resp.data)
          document.getElementById("loader").style.display = "none";
          if(resp.data.code === 200){
            document.getElementById("informationsection").style.display = "none";
            document.getElementById("confirm").classList.add("progressactive");
            document.getElementById("finish").style.display = "block";
            document.getElementById("loader").style.display = "none";
            window.location.href='/'
          }else{
            swal({
              title: "Server Error!",
              text: "Please try again!",
              icon: "warning",
              button: "ok",
            },
            function(){ 
              document.getElementById("informationsection").style.display = "block";
              document.getElementById("loader").style.display = "none";
            });
          }
        })
      .catch(err => {
          console.log(err)
          document.getElementById("informationsection").style.display = "none";
          swal({
            title: "Server Error!",
            text: "Please try again!",
            icon: "warning",
            button: "ok",
          },
          function(){ 
              document.getElementById("informationSection").style.display = "block";
              document.getElementById("loader").style.display = "none";
          });
      })
  }

  removeError = (e) => {
    document.getElementById(e.currentTarget.id).style.border = "1px solid #ced4da";
    document.getElementById(e.currentTarget.id).style.boxShadow = "";
  }

  
  render() {
      const { coursesall,items, selectedTeachers, selectedCourseData, selectArray,teacherwithcourse } = this.state;
      console.log('Items:', this.state.selectedCourse); 
      const getTime=(dateString)=>{
        const date = new Date(dateString);
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };

        return date.toLocaleTimeString('en-US', options);
      }
    const preprocessTeachers = (teachers) => {
      console.log(teachers)
      const teacherMap = teachers.reduce((acc, teacher) => {
        console.log(teacher)
        const { teacherid, agenda, ...rest } = teacher;
        const timeSlot = `${getTime(agenda.slots.starttime)} - ${getTime(agenda.slots.endtime)}`;
        if (!acc[teacherid]) {
          acc[teacherid] = { ...rest, teacherid, timeSlots: [], days: [], courseId: Number(agenda.courseId) }; // Add courseId to teacher object
        }
        acc[teacherid].timeSlots.push(timeSlot);
        acc[teacherid].days.push(agenda.days.day);
        return acc;
      }, {});

      return Object.values(teacherMap);
    };
      const preprocessedTeachers = preprocessTeachers(teacherwithcourse);
console.log(preprocessedTeachers)
console.log(coursesall)
    return (
      <div className="App">
        <header className="App-header">
          <div className="loader" id="loader">
            <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100}/>
          </div>
        <section className="progressbar-section background">
          <ul id="progressbar">
              <li id="packages"><strong>Packages</strong></li>
              <li id="courses"><strong>Courses & Pricing</strong></li>
              <li id="information"><strong>Institution Information</strong></li>
              <li id="confirm"><strong>Finish</strong></li>
          </ul>
        </section>
                <section id="packagesSection" className="pricing" data-progress="packages">
            <div className="container">
                <a href="/institutionSignup" className="previous round">
                    <i className="fa fa-arrow-circle-left fa-2x icon-cog"></i>
                </a>
                <div className="row scroll" id="timing">
                        <div  className="col-lg-3 col-md-3 mt-6 mt-lg-0" id="selectPackageOne">
                            <div className="course-box price">
                                <h3>Create your own course</h3>
                                <ul style={{ textAlign: 'left' }}>
                                    <li>- 50 hours (valid up to 12 months)</li>
                                    <li>- Use your own teachers</li>
                                    <li>- Up to 8 students per class</li>
                                    <li>- Use all On Lang features available</li>
                                </ul>
                                <br />
                                <div className="btn-wrap">
                                    <button className="btn-buy" onClick={this.handlePriceClick} id="1">Select</button>
                                </div>
                            </div>
                        </div>
                    <div className="col-lg-3 col-md-3 mt-6 mt-lg-0 " id="selectPackageTwo">
                        <div className="course-box price " >
                            <h3>Buy Courses</h3>
                            <h6>Select your courses</h6>
                            <ToggleButtonGroup
                            style={{
                              overflowX:'scroll',
                              width:'100%'
                              
                            }} 
                                type='checkbox'
                                className="course-button-container"
                                value={this.state.selectedCourse}
                                onChange={this.handleCourseChange}
                            >
                                {coursesall.filter(a=>a.course.description!=='created by user').map((item, index) => (
                                    <ToggleButton key={index} id={`tbg-btn-${index}`} value={item} className="btn-course">
                                        {item.course.coursename}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <div className="btn-wrap">
                                <button className="btn-buy" onClick={this.getCourses} id="12">Select</button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </section>
           
                <section id="coursesSection" className="pricing" data-progress="courses">
                    <a href="/institutionSignup" className="previous round button-Next" ><i className="fa fa-arrow-circle-left fa-2x icon-cog"></i></a>
                    <div className="row scroll">
                            {this.state.selectedCourse.map((item) => (
                                <div className="col-lg-3 col-md-6 mt-4 mt-lg-0">
                                    <div className="package-box price" onClick={item.status == 0 ? this.handlePriceClick : this.packageFull} id={item.packageid + "_price"}>
                                        <h3>{item.course.coursename} <br /><span style={{ fontSize: "14px" }}></span></h3>
                                        <h4><sup>$</sup>{item.packageprice}<span> / max {item.timing} month</span></h4>
                                        <ul>
                                            <li>{item.noofstudent} Students Max</li>
                                            <li>{item.noofclases} Classes (1 Hour Each)</li>
                                            <li>Features</li>
                                            <li>
                                                <table className="table table-bordered">
                                                    {item.feature1 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature1}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature2 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature2}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature3 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature3}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature4 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature4}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature5 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature5}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature6 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature6}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature7 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature7}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                    {item.feature8 !== "" ?
                                                        <tr>
                                                            <td className="table-cell">{item.feature8}</td>
                                                            <td><i className="fas fa-check"></i></td>
                                                        </tr> : null
                                                    }
                                                </table>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            ))
                        }
                        <a href="/institutionSignup" className="btn-buy">Back</a>
                        <button className="btn-buy" onClick={this.getTeachers} id="1">Next</button> 
                        
                    </div>
                </section>           
                        
                <section id="teachersSection" className="pricing" data-progress="courses"> 
         <button onClick={this.handleBackButtonClick} className="previous round button-Next" ><i className="fa fa-arrow-circle-left fa-2x icon-cog"></i></button>
           {this.state.selectedCourse.length>0 && (
            <>
             {this.state.selectedCourse.map((course,key) => (

                <div key={key} className="row scroll" id={`packages-${course?.course.courseid}`}>
                    <div className="col-lg-3 col-md-6 mt-4 mt-lg-0">
                        <div className="teachers-box price">
                            <h3>Please select your {course.course.coursename} teacher</h3>
                            <div className="scrollable-table">
                                <table id="teachers">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Slots Available</th>
                                
                                            <th>Country</th>
                                        </tr>
                                    </thead>


                                    {this.state.teachers
                                  .length>0?  
                                   <tbody>
                                        {this.state.teachers
                                        .filter(teacher => teacher?.course?.courseid == course.courseid)
                                        .filter(teacher=>teacher?.agenda.length>0)

                                      .map((teacher,index) => (
                                            <tr
                                                key={teacher.teacherid}
                                                className={this.state.selectedTeachers.some(a => a.teacherid === teacher.teacherid && a?.course?.courseid==course.course.courseid) ? 'selected' : ''}
                                                onClick={() => {
                                                
                                                  const isSelected = this.state.selectedTeachers.some(a => a.teacherid === teacher.teacherid && a?.course?.courseid==course.course.courseid);
                                                  if (isSelected) {
                                                    console.log(isSelected)
                                                    this.setState({
                                                      selectedTeachers: this.state.selectedTeachers.filter(a => a.teacherid !== teacher.teacherid && a?.course?.courseid!==course.course.courseid)
                                                    });
                                                  } else {
                                                    if(this.state.selectedTeachers.filter(a=>a?.course?.courseid==course.course.courseid).length>0){
                                                      swal({
                                                        title: "Error!",
                                                        text: "You can only select one teacher per course",
                                                        icon: "warning",
                                                        button: "ok",
                                                    })
                                                  

                                                    }
                                                    else{
                                                      this.setState({
                                                        selectedTeachers: [...this.state.selectedTeachers, teacher]
                                                      });

                                                  }
                                                }
                                                }}
                                            >
                                                <td>{teacher?.firstname}</td>
                                                 <td style={{
                                           gap:'5px',
                                         
                                           width:'auto'
                                                 }}>{teacher?.agenda?.map((agenda)=>{
                                                  return(
                                                    <>
                                                  <td>  {getTime(agenda.slots.starttime) + " - " + getTime(agenda.slots.endtime)+'\n'+agenda.days.day}</td>
                                                    
                                                    </>

                                                  )
                                                 })}</td>
                                            
                                               <td>{teacher?.country}</td>
                                            </tr>
                                            
                                            
                                        ))}
                                    </tbody> : 
                                     <tbody>
                                       <h1>No Teachers Available</h1>
                                    </tbody>}
                                </table>
                            </div>
                                            
                        </div>
                                        
                    </div>
                                    
                </div>
            ))}                        
            </>)}
                <div className="teachers-box">
                            <div className="btn-wrap-next">
                                <button onClick={this.handleBackButtonClick} className="btn-buy">Back </button>
                        <button className="btn-buy" onClick={this.handlePriceClick} id="1">Next</button>
                    </div>
                </div>
           
        </section>

                <section id="informationSection" className="pricing" data-progress="information">
                    <button onClick={this.handleBackButtonClick} className="previous round button-Next" ><i className="fa fa-arrow-circle-left fa-2x icon-cog"></i></button>
          <div className="container">
            <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured">
                  <Form>
                    <h3>Institution Information</h3>
                    <div className="row information-card">
                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="nameOfInstitution">
                         <Form.Label>Name of Institution <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="Institution Name"  onChange={this.handleInputChange} required="true"/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="city">
                         <Form.Label>City <span className="red">*</span></Form.Label>
                         {this.state.gmapsLoaded && (
                            <PlacesAutocomplete 
                              value={this.state.address}
                              onChange={this.handleChange}
                              onSelect={this.handleSelect}
                            >
                              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div>
                                  <input
                                    {...getInputProps({
                                      placeholder: 'Search Places ...',
                                      className: 'location-search-input form-control',
                                      id : 'address',
                                    })}
                                  />
                                  <div className="autocomplete-dropdown-container" id="overlay">
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map(suggestion => {
                                      const className = suggestion.active
                                        ? 'suggestion-item--active'
                                        : 'suggestion-item';
                                      // inline style for demonstration purpose
                                      const style = suggestion.active
                                        ? { backgroundColor: '#fafafa', cursor: 'pointer', padding: '5px' }
                                        : { backgroundColor: '#ffffff', cursor: 'pointer', padding: '5px' };
                                      return (
                                        <div
                                          {...getSuggestionItemProps(suggestion, {
                                            className,
                                            style,
                                          })}
                                        >
                                          <span>{suggestion.description}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </PlacesAutocomplete>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="country">
                         <Form.Label>Country</Form.Label>
                          <Form.Control type="text" placeholder="Country" value={this.state.country} readOnly/>
                        </Form.Group>
                        {/* <Form.Group className="mb-3" controlId="noOfPackages">
                          <Form.Label>No of Packages (select) <span className="red">*</span></Form.Label>
                          <Form.Select aria-label="No Of Packages" onChange={this.handleInputChange}>
                            {selectArray.map((item) => ( 
                              <option value={item}>{item}</option>
                              ))}
                          </Form.Select>
                        </Form.Group> */}
                      
                        <Form.Group className="mb-3" controlId="countrycode">
                         <Form.Label>No of Students <span className="red">*</span></Form.Label>
                          <Form.Control  value={this.state.noofstudents} onChange={(e)=>{
                          this.setState({
                            noofstudents:e.target.value
                          });
                         }}  type="number" placeholder="No of Students"    />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="countrycode">
                         <Form.Label>Course Period (Months) <span className="red">*</span></Form.Label>
                          <Form.Control value={this.state.courseperiods} onChange={(e)=>{
                          this.setState({
                            courseperiods:e.target.value
                          });
                         }}  type="number" placeholder="Course Period (Months)"    />
                        </Form.Group>
                      </div>

                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="typeOfInstitution">
                          <Form.Label>Type of Institution (select) <span className="red">*</span></Form.Label>
                          <Form.Select aria-label="Type of Institution" onChange={this.handleInputChange}>
                            <option value="University">University</option>
                            <option value="School">School</option>
                            <option value="Language Institute">Language Institute</option>
                            <option value="Corporate">Corporate</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="postcode">
                         <Form.Label>Postal Code <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="Postal Code" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="countrycode">
                         <Form.Label>Country Code</Form.Label>
                          <Form.Control type="text" placeholder="Country Code"  value={this.state.countrycode}  readOnly/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="countrycode">
                         <Form.Label>Course Name<span className="red">*</span></Form.Label>
                         <Form.Control type="text" value={this.state.coursename} onChange={(e)=>{
                          this.setState({
                            coursename:e.target.value
                          });
                         }} placeholder="Course Name"    />


                                        </Form.Group>
                                        <Form.Group className="mb-3" hidden controlId="countrycode">
                         <Form.Label>Course Description<span className="red">*</span></Form.Label>
                         <Form.Control  type="text" placeholder="Course Description"  value={'course created by institute'}   />


                                        </Form.Group>
                         
                        <Form.Group className="mb-3" controlId="countrycode">
                         <Form.Label>No of Classes <span className="red">*</span></Form.Label>
                          <Form.Control value={this.state.noofclass} onChange={(e)=>{
                          this.setState({
                            noofclass:e.target.value
                          });
                         }}   type="number" placeholder="No of Classes"    />
                        </Form.Group>
                      </div>

                      <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="startDate">
                          <Form.Label>Start date for your course <span className="red">*</span></Form.Label>
                          <Form.Control type="month" min={this.state.minDate} onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex" id="dateCheck">
                          <Form.Label className="m-3">Please select start date<br />(Courses start the 1st, 10th and 20th of each month)<span className="red">*</span></Form.Label>
                          <Form.Check type="checkbox" label={ this.state.text1st + this.state.startDate} className="m-3" id="bool1st" onChange={this.handleDateCheckboxChange} disabled={this.state.closeBool1st}/>
                          <Form.Check type="checkbox" label={ this.state.text10th + this.state.startDate} className="m-3" id="bool10th" onChange={this.handleDateCheckboxChange} disabled={this.state.closeBool10th}/>
                          <Form.Check type="checkbox" label={ this.state.text20th + this.state.startDate} className="m-3" id="bool20th" onChange={this.handleDateCheckboxChange} disabled={this.state.closeBool20th}/>
                        </Form.Group>
                      </div>
                    </div>
                    <h3 className="mt-3">Contact Information</h3>
                    <div className="row information-card">

                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="firstname">
                         <Form.Label>First Name<span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="First Name" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="position">
                         <Form.Label>Position <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="Position" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="email">
                         <Form.Label>Email <span className="red">*</span></Form.Label>
                          <Form.Control type="email" placeholder="Email" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                         <Form.Label>Password <span className="red">*</span></Form.Label>
                          <Form.Control type="password" placeholder="Password" onChange={this.handleInputChange}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                         <Form.Label>Office Phone <span className="red">*</span></Form.Label>
                          <PhoneInput id="tel" className="form-control" placeholder="Enter office phone" defaultCountry="GB" value={ this.state.tel } onChange={ tel => this.setState({ tel }) } onMouseOut={this.removeError} />
                        </Form.Group>
                      </div>

                      <div className="col-lg-6 col-md-6 mt-6 mt-lg-0">
                        <Form.Group className="mb-3" controlId="lastname">
                         <Form.Label>Last Name <span className="red">*</span></Form.Label>
                          <Form.Control type="text" placeholder="Last Name" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="department">
                         <Form.Label>Department</Form.Label>
                          <Form.Control type="text" placeholder="Department" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="website">
                         <Form.Label>Website</Form.Label>
                          <Form.Control type="text" placeholder="Website" onChange={this.handleInputChange}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="phone">
                         <Form.Label>Mobile <span className="red">*</span></Form.Label>
                          <PhoneInput id="phone" className="form-control" placeholder="Enter phone number" defaultCountry="GB" value={ this.state.phone } onChange={ phone => this.setState({ phone }) } onMouseOut={this.removeError}/>
                        </Form.Group>
                      </div>

                    </div>
                  </Form>
                  <div className="btn-wrap-next">

                                    <button onClick = {this.handleBackButtonClick} className="btn-buy">Back </button>
                    <button type="submit" className="btn-buy button-Next" onClick={this.validateForm}>Next</button>
                  </div>
                </div>
            </div>

          </div>
        </section>
        <section id="finish" className="pricing">
          <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured">
                    <h3>Finish</h3>
                    <div className="information-card center">
                      <img id="tick" alt="On Lang" src="https://www.onlang.net/Images/tick.svg" animated_src="https://www.onlang.net/Images/tick.gif" width="360" height="360" auto_play="1" rubbable="1"></img>
                      <h6 className="thankyou-message">Thanks for filling out our form! We've sent you an email at the email address you provided.</h6>
                    </div>
                    <div className="btn-wrap">
                      <a href="/home" className="btn-buy">Done</a>
                    </div>                
                </div>
              </div>
          </div>
        </section>
      </header>
      </div>
      );
    }
}