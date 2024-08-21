import './agenda.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import React from 'react';
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import moment from "moment";
import { Form, Button, Card, ButtonGroup, ToggleButton } from "react-bootstrap";
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
            endDate: null,
            dayTimeSlots: {}
        };
    }

    componentDidMount() {
        if (this.props.token) {
            window.location = configData.SERVER_URL;
        }
        const savedToken = localStorage.getItem('loginToken');
        this.getSlots();

        document.getElementById("summaryViewSection").style.display = "none";
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
            console.log(resp.data);
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
            });
    }

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
            // Show error message
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

    handleDayChange = (day) => {
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

    handleTimeChange = (selectedDay, slotId) => {
        console.log("Selected Day ID:", selectedDay.id);
        console.log("Selected Slot ID:", slotId);
        this.setState(prevState => ({
            dayTimeSlots: {
                ...prevState.dayTimeSlots,
                [selectedDay.id]: slotId
            }
        }), () => {
            console.log("Updated dayTimeSlots:", this.state.dayTimeSlots);
        });
    }

    daysSelected = (e) => {
        if (this.state.selectedDays.length < 2) {
            swal({
                title: "Selection Issue",
                text: "Please select at least 2 days!",
                icon: "warning",
                button: "ok",
            });
            return;
        }
        const selectedSlots = [];
        this.state.selectedDays.forEach((day,i) => {
            const slot = this.state.slots[i]
            
                selectedSlots.push({ day, slot });
            
        });

        this.setState({
            selectedSlots: selectedSlots
        });

        console.log("Selected Days:", this.state.selectedDays);
        console.log("Navigating to summaryViewSection");
        document.getElementById("periodSelectSection").style.display = "none";
        document.getElementById("summaryViewSection").style.display = "block";
    }

    groupViewBackClicked = (e) => {
        document.getElementById("periodSelectSection").style.display = "block";
        document.getElementById("summaryViewSection").style.display = "none";
    }

    hitAgendaCreationApi = (e) => {
        document.getElementById("loader").style.display = "block";
        const savedToken = localStorage.getItem('loginToken');
        var bodyFormData = new URLSearchParams();
        bodyFormData.append('selectedSlots', JSON.stringify(this.state.selectedSlots));
        console.log("Selected Slots:", this.state.selectedSlots);
        axios({
            method: "post",
            url: configData.SERVER_URL + 'teachers/createagenda',
            data: bodyFormData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "authtoken": savedToken
            },
        }).then(resp => {
            console.log(resp.data);
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
                console.log(err);
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

                                        {/* package name */}

                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h2>Package Name</h2>
                                        </div>
                                        <hr className="my-4 mx-auto" style={{ width: '100%', borderColor: '#d3d3d3' }} />

                                        {/* date selection */}

                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h5 className="headline">Period you are available</h5>
                                            <div className="datepicker-container d-flex align-items-center">
                                                <div className="date-picker">
                                                    <DatePicker
                                                        selected={this.state.startDate}
                                                        onChange={this.handleStartDateChange}
                                                        selectsStart
                                                        startDate={this.state.startDate}
                                                        endDate={this.state.endDate}
                                                        maxDate={moment().add(3, 'months').toDate()} // maximum date 3 months from today
                                                        placeholderText="Select start date"
                                                        popperPlacement="auto"
                                                        className="datepicker-dropdown"
                                                    />
                                                </div>
                                                <div className="date-picker">
                                                    <DatePicker
                                                        selected={this.state.endDate}
                                                        onChange={this.handleEndDateChange}
                                                        selectsEnd
                                                        startDate={this.state.startDate}
                                                        endDate={this.state.endDate}
                                                        minDate={this.state.startDate} // minimum date to the selected start date
                                                        maxDate={moment().add(3, 'months').toDate()} // maximum date to 3 months from today
                                                        placeholderText="Select end date"
                                                        popperPlacement="auto"
                                                        className="datepicker-dropdown"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* day selection */}

                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h5 className="headline">Please select your available days for classes</h5>
                                            <ButtonGroup className="day-button-container">
                                                {this.state.days.map((day) => (
                                                    <ToggleButton
                                                        key={day.id}
                                                        id={`toggle-${day.id}`}
                                                        type="checkbox"
                                                        variant="secondary"
                                                        checked={this.state.selectedDays.includes(day)}
                                                        onChange={() => this.handleDayChange(day)}
                                                        className="day-button"
                                                    >
                                                        {day.day}
                                                    </ToggleButton>
                                                ))}
                                            </ButtonGroup>
                                        </div>

                                        {/* time selection */}

                                        <div className="time-pair-container">
                                            <div className="row justify-content-center">
                                                <div className="time-pair">
                                                    {this.state.selectedDays.map((selectedDay) => (
                                                        <div key={selectedDay.id} className="mt-3 d-flex align-items-center justify-content-end">
                                                            <div className="me-2">{selectedDay.day}</div>
                                                            <div>
                                                                <Form.Select
                                                                    className="time-dropdown"
                                                                    aria-label="Default select example"
                                                                    onChange={(e) => this.handleTimeChange(selectedDay, e.target.value)}
                                                                >
                                                                    <option>Select time</option>
                                                                    {this.state.slots.map((slot) => (
                                                                        <option key={slot.slotid} value={slot.slotid}>
                                                                            {moment(slot.starttime).format('h:mm A')} - {moment(slot.endtime).format('h:mm A')}
                                                                        </option>
                                                                    ))}
                                                                </Form.Select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="btn-wrap-next">
                                            <button type="button" className="btn-buy" onClick={this.daysSelected}>Next</button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* summary and confirmation */}

                    <section className="pricing" id="summaryViewSection">
                        <div className="container">
                            <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                                <div className="box price featured no-padding">
                                    <Card className="p-3">
                                        <h3>Create Agenda</h3>

                                        {/* package name */}
                                        <div className="row d-flex align-items-center justify-content-center">
                                            <h2>Package Name</h2>
                                        </div>

                                        <hr className="my-4 mx-auto" style={{ width: '100%', borderColor: '#d3d3d3' }} />
                                        <div className="row d-flex align-items-center justify-content-center">
                                            <div className="col-lg-8 col-md-8">
                                                <p><strong>Date Range:</strong> {this.state.startDate && this.state.endDate ? `${moment(this.state.startDate).format('MMMM D, YYYY')} - ${moment(this.state.endDate).format('MMMM D, YYYY')}` : 'Select dates'}</p>

                                                <p><strong>Day(s) and Time Range(s):</strong></p>
                                                {this.state.selectedDays.map((selectedDay) => {
                                                    const slotId = this.state.dayTimeSlots[selectedDay.id];
                                                    const slot = this.state.slots.find(slot => slot.slotid == slotId); // Use == for comparison since slotId is a string
                                                    console.log("Slot for", selectedDay.day, ":", slot);
                                                    
                                                    return (
                                                        <p key={selectedDay.id}>
                                                            {selectedDay.day} {slot ? `${moment(slot.starttime).format('h:mm A')} to ${moment(slot.endtime).format('h:mm A')}` : 'No time selected'}
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="btn-wrap-next">
                                            <button type="button" className="btn-buy" onClick={this.groupViewBackClicked}>Back</button>
                                            <button type="submit" className="btn-buy" onClick={this.hitAgendaCreationApi}>Confirm</button>
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
