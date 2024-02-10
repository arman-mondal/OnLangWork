import React from 'react';
import {Form, Card} from "react-bootstrap";
import Loader from "react-js-loader";
import swal from 'sweetalert';
import axios from 'axios';
import configData from "../../config.json";
import "./onlineClass.css";
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"

export default class OnlineClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onlineStudents : [],
      socket : "",
      me : "",
      stream : "",
      receivingCall: false,
      caller : "",
      callerSignal : null,
      callAccepted : false,
      idToCall : "",
      callEnded :  false,
      name : "",
      myVideo : React.createRef(),
      userVideo : React.createRef(),
      connectionRef : React.createRef(),
      idToCall : "",
      isVideo : true,
      isAudio : true,
      colorAudio : "#D3D3D3",
      colorVideo : "#D3D3D3",
      videoClass : "fas fa-video",
      audioClass : "fas fa-microphone"
    }
  }

  componentDidMount () {
    const socket = io.connect('http://onlang.co.uk:3001')
    const savedToken = localStorage.getItem('loginToken');
    const onlineStudents = [];
    for (var i = 1; i <= 5; i++) { 
      onlineStudents.push(i);
    } 
    this.setState({
        onlineStudents: onlineStudents,
        socket : socket
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          this.setState({
            stream: stream
        });
        this.state.myVideo.current.srcObject = stream
    })

    socket.on("me", (id) => {
          console.log(id)
          this.setState({
            me : id
          })
        })

    socket.on("callUser", (data) => {
      this.setState({
          receivingCall: true,
          caller : data.from,
          name : data.name,
          callerSignal: data.signal
      });
    })

    document.getElementById("chat-div").style.display = "none";
    document.getElementById("loader").style.display = "none";
  }

  callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.state.stream
    })
    peer.on("signal", (data) => {
      this.state.socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: this.state.me,
        name: this.state.name
      })
    })
    peer.on("stream", (stream) => {
      
        this.state.userVideo.current.srcObject = this.state.stream
      
    })
    this.state.socket.on("callAccepted", (signal) => {
      this.setState({
        callAccepted: true
      });
      peer.signal(signal)
    })

    this.state.connectionRef.current = peer
  }

  answerCall =() =>  {
    this.setState({
      callAccepted: true
    });
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.state.stream
    })
    peer.on("signal", (data) => {
      this.state.socket.emit("answerCall", { signal: data, to: this.state.caller })
    })
    peer.on("stream", (stream) => {
      this.state.userVideo.current.srcObject = stream
    })

    peer.signal(this.state.callerSignal)
    this.state.connectionRef.current = peer
  }

  leaveCall = () => {
    this.setState({
      callEnded: true
    });
    this.state.connectionRef.current.destroy()
  }

  chatHide = (e) => {
    document.getElementById("chat-div").style.display = "none";
  }

  chatShow = (e) => {
    document.getElementById("chat-div").style.display = "block";
  }

  // Toggle Video
  toggleVideo = (e) => {
      document.getElementById('video').style.backgroundColor = this.state.colorVideo;
      if (this.state.isVideo) {
          this.state.colorVideo = '#FCD21C';
          this.state.videoClass = "fas fa-video-slash";
      } else {
          this.state.colorVideo = '#D3D3D3';
          this.state.videoClass = "fas fa-video";
      }
      this.state.isVideo = !this.state.isVideo;
      this.state.stream.getVideoTracks()[0].enabled = this.state.isVideo;
      this.setState({
        videoClass: this.state.videoClass
      });
  }

  // Toggle Audio
  toggleAudio = (e) => {
      document.getElementById('audio').style.backgroundColor = this.state.colorAudio;
      if (this.state.isAudio) {
          this.state.colorAudio = '#FCD21C';
          this.state.audioClass = "fas fa-microphone-slash";
      } else {
          this.state.colorAudio = '#D3D3D3';
          this.state.audioClass = "fas fa-microphone";
      }
      this.state.isAudio = !this.state.isAudio;
      this.state.stream.getAudioTracks()[0].enabled = this.state.isAudio;
      this.setState({
        audioClass: this.state.audioClass
      });
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
              <div className="col-lg-10 col-md-10 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Live Class</h3>
                      <div className="row">
                        {this.state.onlineStudents.map((onlineStudent) => ( 
                          <div className=" col-xl-3 col-lg-4 col-md-6 col-sm-12">
                            {this.state.callAccepted && !this.state.callEnded ?
                              <video className="studentVideo" playsInline ref={this.state.userVideo} autoPlay  poster="/Images/nocam.jpeg"/> : 
                              <video className="studentVideo" poster="/Images/nocam.jpeg"/>
                            }
                          </div>
                          )
                        )}
                      </div>

                      <div className="myVideoDiv">
                        {this.state.stream && <video className="myVideo" playsInline muted autoPlay ref={this.state.myVideo} poster="/Images/nocam.jpeg"/> }
                        <div className="d-inline">
                          <button id="video" className="myVideoControls" onClick={this.toggleVideo}><i className={this.state.videoClass}></i></button>
                          <button id="audio" className="myVideoControls" onClick={this.toggleAudio}><i className={this.state.audioClass}></i></button>
                          <button className="myVideoControls" onClick={this.chatShow}><i className="fas fa-comments"></i></button>
                          {this.state.callAccepted && !this.state.callEnded ? (
                            <button className="myVideoControls" onClick={this.leaveCall}><i className="fas fa-times"></i></button>
                          ) : (
                            <button className="myVideoControls" onClick={() => this.callUser(this.state.idToCall)}><i className="fas fa-phone"></i></button>
                          )}
                        </div>
                        
                      </div>

                      <div id="chat-div" className="myChatDiv">
                        <div className="myChatHead" onClick={this.chatHide}>
                        <h6>Chat</h6>
                        </div>
                        <div className="chat-window">

                        </div>
                        <div className="chat-input d-inline">
                          <input placeholder="say something..."></input>
                          <button><i class="fa fa-paper-plane"></i></button>
                        </div>
                      </div>



                      <div className="myVideoCallDiv">
                      {this.state.receivingCall && !this.state.callAccepted ? (
                          <div className="caller">
                          <h1 >{this.state.name} is calling...</h1>
                          <Button variant="contained" color="primary" onClick={this.answerCall}>
                            Answer
                          </Button>
                        </div>
                      ) : 
                        <h5><i className="fas fa-phone"></i> No Calls</h5>
                      }
                        <CopyToClipboard text={this.state.me} style={{ marginBottom: "2rem" }}>
                          <Button variant="contained" color="primary">
                            Copy ID
                          </Button>
                        </CopyToClipboard>
                        <TextField
                          id="filled-basic"
                          label="ID to call"
                          variant="filled"
                          value={this.state.idToCall}
                          onChange={(e) => this.setState({ idToCall : e.target.value})}
                        />
                      </div>

                  </Card>
                </div>
              </div>
            </div>
          </section>
        </header>
      </div>
    )
  }
}