import './agenda.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import { Card, ButtonGroup, ToggleButton, Button } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default class CreateAgenda extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: 0,
            slots: [],
            selectedSlots: [],
            days: [],
            selectedDays: [],
            startDate: null,
            endDate: null
        };
    }

    componentDidMount() {
        if (this.props.token) {
            window.location = configData.SERVER_URL
        }
        const savedToken = localStorage.getItem('loginToken');
        this.getSlots();

        document.getElementById("loader").style.display = "none";
    }

    getSlots() {
        axios({
            method: "get",
            url: configData.SERVER_URL + 'slots/getall',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "authtoken": this.props.match.params.token
            },
        }).then(resp => {
            console.log(resp.data)
            if (resp.data.code === 200) {
                this.setState({
                    slots: resp.data.slots,
                    days: resp.data.days
                });
            } else {
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
    }

    // Date Selection

    selectStartDate = (date) => {
        this.setState({
            startDate: date,
            endDate: null // Reset end date if it's after the new start date
        });
    }

    selectEndDate = (date) => {
        if (this.state.startDate && moment(date).diff(this.state.startDate, 'months') <= 3) {
            this.setState({
                endDate: date
            });
        } else {
            // Show error message or prevent selection
            swal({
                title: "Date Range Error",
                text: "Please select an end date within 3 months from the start date.",
                icon: "warning",
                button: "OK"
            });
        }
    }

    handleStartDateChange = (date) => {
        this.setState({
            startDate: date
        });
    };

    handleEndDateChange = (date) => {
        this.setState({
            endDate: date
        });
    };

    // Day Selection

    toggleDay = (day) => {
        if (this.state.selectedDays.includes(day)) {
            this.setState((prevState) => ({
                selectedDays: prevState.selectedDays.filter((selectedDay) => selectedDay !== day),
            }));
        } else {
            this.setState((prevState) => ({
                selectedDays: [...prevState.selectedDays, day],
            }));
        }
    };

    daysBackClick = (e) => {
        document.getElementById("studentSelectSection").style.display = "block";
        document.getElementById("daysSelectSection").style.display = "none";
    }

    daysSelected = (e) => {
        if (this.state.selectedDays.length < 2) {
            swal({
                title: "Selection Issue",
                text: "Please select atleast 2 days for group!",
                icon: "warning",
                button: "ok",
            });
            return;
        }
        document.getElementById("daysSelectSection").style.display = "none";
        document.getElementById("slotSelectSection").style.display = "block";
    }

    hitAgendaCreationApi = (e) => {
        document.getElementById("loader").style.display = "block";
        const savedToken = localStorage.getItem('loginToken');
        var bodyFormData = new URLSearchParams();
        bodyFormData.append('selectedSlots', JSON.stringify(this.state.selectedSlots));
        axios({
            method: "post",
            url: configData.SERVER_URL + 'teachers/createagenda',
            data: bodyFormData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "authtoken": savedToken
            },
        }).then(resp => {
            console.log(resp.data)
            document.getElementById("loader").style.display = "none";
            if (resp.data.code === 200) {
                swal({
                    title: "Agenda",
                    text: "Agenda created successfully",
                    icon: "success",
                    button: "ok",
                }).then(function () {
                    window.location.href = "/agenda";
                });
            } else {
                swal({
                    title: "Server Error!",
                    text: "Please try again!",
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
                    text: "Please try again!",
                    icon: "warning",
                    button: "ok",
                });
            });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div className="loader" id="loader">
                        <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100} />
                    </div>

                    <section className="pricing" id="periodSelectSection">
                        <div className="container">
                            <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                                <div className="box price featured no-padding">
                                    <Card className="p-3">
                                        <h3>Create Agenda</h3>

                                        {/* Package name */}

                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h2>Package Name</h2>
                                        </div>
                                        <hr className="my-4 mx-auto" style={{ width: '100%', borderColor: '#d3d3d3' }} />

                                        {/* Date selection */}

                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h5 className="headline"> Period you are available</h5>
                                            <div className="datepicker-container d-flex align-items-center">
                                                <div className="date-picker">
                                                    <DatePicker
                                                        selected={this.state.startDate}
                                                        onChange={this.handleStartDateChange}
                                                        selectsStart
                                                        startDate={this.state.startDate}
                                                        endDate={this.state.endDate}
                                                        maxDate={moment().add(3, 'months').toDate()} // maximum date
                                                        placeholderText="Select start date"
                                                        popperPlacement="auto"
                                                        className="datepicker-dropdown"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day Selection */}

                                        <div className="row d-flex align-items-center justify-content-center mt-5">
                                            <h5> Select Days</h5>
                                            <div className="day-select-container d-flex align-items-center">
                                                {this.state.days.map((day, index) => (
                                                    <ToggleButton
                                                        key={index}
                                                        id={`day-toggle-${index}`}
                                                        type="checkbox"
                                                        variant="secondary"
                                                        checked={this.state.selectedDays.includes(day)}
                                                        value={day}
                                                        onChange={() => this.toggleDay(day)}
                                                        className="day-toggle"
                                                    >
                                                        {day}
                                                    </ToggleButton>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="row d-flex align-items-center justify-content-center mt-5">
                                            <div className="col-md-12 text-center">
                                                <Button variant="outline-dark" onClick={this.daysBackClick}>Back</Button>
                                                <Button variant="dark" onClick={this.daysSelected}>Next</Button>
                                            </div>
                                        </div>

                                        {/* Loader */}

                                        <div className="loader" id="loader">
                                            <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100} />
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