import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { Form, Button, Card, Badge, ToggleButton, ButtonGroup } from 'react-bootstrap';
import Loader from 'react-js-loader';
import swal from 'sweetalert';
import configData from '../../config.json';

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
            loading: false,
        };
    }

    componentDidMount() {
        if (this.props.token) {
            window.location = configData.SERVER_URL;
        }
        const savedToken = localStorage.getItem('loginToken');
        this.getSlots();
    }

    getSlots() {
        this.setState({ loading: true });
        axios({
            method: 'get',
            url: configData.SERVER_URL + 'slots/getall',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                authtoken: this.props.match.params.token,
            },
        })
            .then((resp) => {
                if (resp.data.code === 200) {
                    this.setState({
                        slots: resp.data.slots,
                        days: resp.data.days,
                        loading: false,
                    });
                } else {
                    this.setState({ loading: false });
                    swal({
                        title: 'Server Not Responding',
                        text: 'Please reload the page',
                        icon: 'warning',
                        button: 'ok',
                    });
                }
            })
            .catch((err) => {
                this.setState({ loading: false });
                swal({
                    title: 'Server Not Responding',
                    text: 'Please reload the page',
                    icon: 'warning',
                    button: 'ok',
                });
            });
    }

    selectStartDate = (date) => {
        this.setState({
            startDate: date,
            endDate: null, // Reset end date if it's after the new start date
        });
    };

    selectEndDate = (date) => {
        if (this.state.startDate && moment(date).diff(this.state.startDate, 'months') <= 3) {
            this.setState({
                endDate: date,
            });
        } else {
            // Show error message or prevent selection
            swal({
                title: 'Date Range Error',
                text: 'Please select an end date within 3 months from the start date.',
                icon: 'warning',
                button: 'OK',
            });
        }
    };

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

    removeDay = (day) => {
        this.setState((prevState) => ({
            selectedDays: prevState.selectedDays.filter((selectedDay) => selectedDay !== day),
        }));
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <div className="loader" style={{ display: this.state.loading ? 'block' : 'none' }}>
                        <Loader type="spinner-circle" bgColor="#ffffff" title="LOADING..." color="#ffffff" size={100} />
                    </div>
                    <section className="pricing" id="periodSelectSection">
                        <div className="container">
                            <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                                <div className="box price featured no-padding">
                                    <Card className="p-3">
                                        <h3>Create Agenda</h3>
                                        <div className="row d-flex align-items-center justify-content-center div-scroll-y">
                                            <h5 className="text-center">Period you are available</h5>
                                            <div className="col-lg-6 col-md-6 mt-3">
                                                <Form.Select
                                                    aria-label="Default select example"
                                                    onChange={(e) => this.selectStartDate(e.target.value)}
                                                >
                                                    <option>Select start date</option>
                                                    {/* Render calendar days for start date selection */}
                                                </Form.Select>
                                            </div>
                                            <div className="col-lg-6 col-md-6 mt-3">
                                                <Form.Select
                                                    aria-label="Default select example"
                                                    onChange={(e) => this.selectEndDate(e.target.value)}
                                                >
                                                    <option>Select end date</option>
                                                    {/* Render calendar days for end date selection */}
                                                </Form.Select>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="pricing" id="daysSelectSection">
                        <div className="container">
                            <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                                <div className="box price featured no-padding">
                                    <Card className="p-3">
                                        <h3>Create Agenda</h3>
                                        <div className="row d-flex align-items-center justify-content-center div-scroll-y">
                                            <h5 className="text-center">Please select your available days for classes</h5>
                                            <ButtonGroup className="mb-2">
                                                {this.state.days.map((day) => (
                                                    <ToggleButton
                                                        key={day.id}
                                                        id={`toggle-${day.id}`}
                                                        type="checkbox"
                                                        variant="secondary"
                                                        checked={this.state.selectedDays.includes(day)}
                                                        onChange={() => this.toggleDay(day)}
                                                    >
                                                        {day.day}
                                                    </ToggleButton>
                                                ))}
                                            </ButtonGroup>
                                        </div>
                                        <div className="row d-flex align-items-center justify-content-center div-scroll-y">
                                            {this.state.selectedDays.map((selectedDay) => (
                                                <div className="col-lg-6 col-md-6 mt-3" key={selectedDay.id}>
                                                    <h5 className="text-center">Time for {selectedDay.day}</h5>
                                                    <Form.Select aria-label="Default select example">
                                                        <option>Select time</option>
                                                        {this.state.slots.map((slot) => (
                                                            <option key={slot.id} value={slot.id}>
                                                                {moment(slot.starttime).format('h:mm:ss A')} -{' '}
                                                                {moment(slot.endtime).format('h:mm:ss A')}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="btn-wrap-next">
                                            <button type="button" className="btn-buy button-Next" onClick={this.hitAgendaCreationApi}>
                                                Next
                                            </button>
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
// Continued from previous code...

addSlot = (slot, day) => {
    const selectedSlot = { slot: slot, day: day };
    const preSlot = this.state.selectedSlots.find((preSelectedSlot) => preSelectedSlot.slot.slotid === slot.slotid && preSelectedSlot.day.id === day.id);

    if (!preSlot) {
        this.setState((prevState) => ({
            selectedSlots: [...prevState.selectedSlots, selectedSlot],
        }));
    }
};

removeSlot = (slot) => {
    this.setState((prevState) => ({
        selectedSlots: prevState.selectedSlots.filter((selectedSlot) => selectedSlot !== slot),
    }));
};

daysBackClick = () => {
    this.setState({ show: 0 });
};

daysSelected = () => {
    if (this.state.selectedDays.length < 2) {
        swal({
            title: 'Selection Issue',
            text: 'Please select at least 2 days for group!',
            icon: 'warning',
            button: 'ok',
        });
        return;
    }
    this.setState({ show: 1 });
};

slotsBackClick = () => {
    this.setState({ show: 1 });
};

slotSelected = () => {
    this.setState({ show: 2 });
};

groupViewBackClicked = () => {
    this.setState({ show: 1 });
};

hitAgendaCreationApi = () => {
    this.setState({ loading: true });
    const savedToken = localStorage.getItem('loginToken');
    const bodyFormData = new URLSearchParams();
    bodyFormData.append('selectedSlots', JSON.stringify(this.state.selectedSlots));
    axios({
        method: 'post',
        url: configData.SERVER_URL + 'teachers/createagenda',
        data: bodyFormData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authtoken: savedToken,
        },
    })
        .then((resp) => {
            console.log(resp.data);
            this.setState({ loading: false });
            if (resp.data.code === 200) {
                swal({
                    title: 'Agenda',
                    text: 'Agenda created successfully',
                    icon: 'success',
                    button: 'ok',
                }).then(function () {
                    window.location.href = '/agenda';
                });
            } else {
                swal({
                    title: 'Server Error!',
                    text: 'Please try again!',
                    icon: 'warning',
                    button: 'ok',
                });
            }
        })
        .catch((err) => {
            this.setState({ loading: false });
            console.log(err);
            swal({
                title: 'Server Error!',
                text: 'Please try again!',
                icon: 'warning',
                button: 'ok',
            });
        });
};

render() {
    return (
        <div className="App">
            <header className="App-header">
                <div className="loader" style={{ display: this.state.loading ? 'block' : 'none' }}>
                    <Loader type="spinner-circle" bgColor="#ffffff" title="LOADING..." color="#ffffff" size={100} />
                </div>
                {this.state.show === 0 && (
                    <section className="pricing" id="periodSelectSection">
                        {/* Period Selection UI */}
                    </section>
                )}
                {this.state.show === 1 && (
                    <section className="pricing" id="daysSelectSection">
                        {/* Days Selection UI */}
                    </section>
                )}
                {this.state.show === 2 && (
                    <section className="pricing" id="slotSelectSection">
                        {/* Slot Selection UI */}
                    </section>
                )}
                {this.state.show === 3 && (
                    <section className="pricing" id="slotViewSection">
                        {/* Agenda Review/Summary UI */}
                    </section>
                )}
            </header>
        </div>
    );
}
}