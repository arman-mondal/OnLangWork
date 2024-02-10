import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import micmute from "../assets/micmute.svg";
import micunmute from "../assets/micunmute.svg";
import webcam from "../assets/webcam.svg";
import webcamoff from "../assets/webcamoff.svg";
import "./onlineClass.css";
import {Badge, Card, Button} from "react-bootstrap";
import Loader from "react-js-loader";
import axios from 'axios';
import swal from 'sweetalert';
import configData from "../../config.json";
import useMediaRecorder from '@wmik/use-media-recorder';
import Swatch from "../../components/whiteboard/swatch";
import rough from "roughjs/bundled/rough.esm";

const Container = styled.div`
  height: 100vh;
  width: 20%;
`;

const Controls = styled.div`
  margin: 3px;
  padding: 5px;
  height: 27px;
  width: 98%;
  background-color: rgba(255, 226, 104, 0.1);
  margin-top: -8.5vh;
  filter: brightness(1);
  z-index: 1;
  border-radius: 6px;
`;

const ControlSmall = styled.div`
  margin: 3px;
  padding: 5px;
  height: 16px;
  width: 98%;
  margin-top: -6vh;
  filter: brightness(1);
  z-index: 1;
  border-radius: 6px;
  display: flex;
  justify-content: center;
`;

const ImgComponent = styled.img`
  cursor: pointer;
  height: 25px;
`;

const ImgComponentSmall = styled.img`
  height: 15px;
  text-align: left;
  opacity: 1;
`;

const StyledVideo = styled.video`
  height: auto;
  width: 100%;
`;
const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);
  return <StyledVideo playsInline autoPlay ref={ref}/>;
};

const gen = rough.generator();

function createElement(id, x1, y1, x2, y2) {
  const roughEle = gen.line(x1, y1, x2, y2);
  return { id, x1, y1, x2, y2, roughEle };
}

const midPointBtw = (p1, p2) => {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
};

export const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (x1 < x2 || (x1 === x2 && y1 < y2)) {
    return { x1, y1, x2, y2 };
  } else {
    return { x1: x2, y1: y2, x2: x1, y2: y1 };
  }
};

const Room = (props) => {
  const userProfile = {
    name : `${props.user.firstname} ${props.user.lastname}`,
    isteacher : true,
  }

  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000");
  const [textSize, setTextSize] = useState("20px");

  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const [points, setPoints] = useState([]);
  const [path, setPath] = useState([]);

  const [action, setAction] = useState("none");
  const [toolType, setToolType] = useState("pencil");
  const [selectedElement, setSelectedElement] = useState(null);

  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const [title, setTitle] = useState("Live Class");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;
  const classid = props.match.params.classid;
  const savedToken = localStorage.getItem('loginToken');
  let recording = undefined;
  let videoSaved = false;
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };
  let {
    error, status, mediaBlob, stopRecording, startRecording, clearMediaBlob
  } = useMediaRecorder({
    recordScreen: true, blobOptions: { type: 'video/webm' }, mediaStreamConstraints: { audio: true, video: true }
  });
  useEffect(() => {
    socketRef.current = io.connect(configData.SOCKET_SERVER_URL);
    createStream();
    getClassInfo();
    document.getElementById("loader").style.display = "none";
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";

    context.save();

    const drawpath = () => {
      path.forEach((stroke, index) => {
        context.beginPath();

        stroke.forEach((point, i) => {
          var midPoint = midPointBtw(point.clientX, point.clientY);

          context.quadraticCurveTo(
            point.clientX,
            point.clientY,
            midPoint.x,
            midPoint.y
          );
          context.lineTo(point.clientX, point.clientY);
          context.strokeStyle = "#ff0000";
          context.stroke();
        });
        context.closePath();
        context.font = textSize +" Time New Roman";
        context.fillStyle = textColor; 
        let inputText = textInput.split("\n")
        let yaxis = 40
        inputText.forEach(line => {
          context.fillText(line, 20, yaxis);
          yaxis += (parseInt(textSize.substring(0,textSize.length - 2)) + 2)
        })
        context.save();
      });
    };

    const roughCanvas = rough.canvas(canvas);

    if (path !== undefined) drawpath();

    elements.forEach(({ roughEle }) => {
      context.globalAlpha = "1";
      roughCanvas.draw(roughEle);
    });

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements, path]);

  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true)
  },[])


  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = textSize +" Time New Roman";
    context.fillStyle = textColor; 
    let inputText = textInput.split("\n")
    let yaxis = 40
    inputText.forEach(line => {
      context.fillText(line, 20, yaxis);
      yaxis += (parseInt(textSize.substring(0,textSize.length - 2)) + 2)
    })
    context.save();
  },[textInput, textColor, textSize])

  const detectKeyDown = (e) => {
    if(e.keyCode == 8){
      setTextInput((textInput) => textInput.slice(0,-1) )
    }else{
      if((e.keyCode >= 65 && e.keyCode < 90) || (e.keyCode == 32) || (e.keyCode >= 48 && e.keyCode < 57) || (e.keyCode == 188) || e.keyCode == 190){
        setTextInput((textInput) => textInput + e.key)
      }else{
        if(e.keyCode == 13){
          setTextInput((textInput) => textInput + "\n")
        }
      }
    }
  }

  function getClassInfo(){
    var bodyFormData = new FormData();
    bodyFormData.append('classid', classid);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'classes/getclassinfo',
        data: bodyFormData,
        headers: { 
          "authtoken" : localStorage.getItem('loginToken')
        },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code == 200){
          setTitle(`Live Class ${resp.data.classInfo.course.coursename} (${resp.data.classInfo.course.accent.accentname}) ${resp.data.classInfo.subcriptions.college.collegename} ${resp.data.classInfo.classstudents.length} students`)
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
  }

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("join room", {roomID,userProfile});
        socketRef.current.on("all users", (users) => {
          console.log(users)
          const peers = [];
          users.forEach((user) => {
            const peer = createPeer(user.id, socketRef.current.id, stream, userProfile);
            peersRef.current.push({
              peerID: user.id,
              peerUser: user.userProfile,
              peer,
            });
            peers.push({
              peerID: user.id,
              peerUser: user.userProfile,
              peer,
            });
            console.log("Iam Added from create peer",peer)
            console.log(peers)
          });
          setPeers(peers);
        });
        socketRef.current.on("user joined", (payload) => {
          console.log("==",payload)
          const peer = addPeer(payload.signal, payload.callerID, stream, payload.userProfile);
          // peersRef.current.push({
          //   peerID: payload.callerID,
          //   peerUser: payload.userProfile,
          //   peer,
          // });
          const peerObj = {
            peer,
            peerUser: payload.userProfile,
            peerID: payload.callerID,
          };
          console.log("Iam Added from add peer",peer)
          console.log(peers)
          setPeers((users) => [...users, peerObj])
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("change", (payload) => {
          setUserUpdate(payload);
        });

        socketRef.current.on("room closed", () => {
          window.location.href = "/createclass";
        });
      });
  }

  function createPeer(userToSignal, callerID, stream, userProfile) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        userProfile
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream, userProfile) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID, userProfile });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function disconnectCall(){
    var bodyFormData = new URLSearchParams();
    bodyFormData.append('classid', classid);
    bodyFormData.append('uuid', roomID);
    axios({
      method: "post",
      url:  configData.SERVER_URL + 'classes/closeliveclass',
      data: bodyFormData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code == 200){
          socketRef.current.emit("class closed");
          window.location.href = "/createclass";
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
  }

  function chatHide(){
    document.getElementById("chat-div").style.display = "none";
  }

  function chatShow(){
    document.getElementById("chat-div").style.display = "block";
  }

  function Player({ srcBlob, audio }) {
    if (!srcBlob) {
      return null;
    }
    recording = srcBlob
    videoSaved = false
    document.getElementById("saveRecordingBtn").disabled = false
    // return null
    if (audio) {
      return (
        <audio src={URL.createObjectURL(srcBlob)} controls />
      )
    }
  
    return (
      <video
        src={URL.createObjectURL(srcBlob)}
        style={{width:"100%"}}
        controls
      />
    );
  }
  function saveRecording(){
    console.log("Jawad")
    var bodyFormData = new FormData();
    bodyFormData.append('classid', classid);
    bodyFormData.append('uuid', roomID);
    bodyFormData.append('recording',recording);
    axios({
        method: "post",
        url:  configData.SERVER_URL + 'recordings/upload',
        data: bodyFormData,
        headers: { 
          "authtoken" : localStorage.getItem('loginToken')
        },
    }).then(resp => {
        console.log(resp.data)
        if(resp.data.code == 200){
          videoSaved = true
          swal({
            title: "Recording Saved!",
            text: "Your recording saved successfully",
            icon: "success",
            button: "ok",
          });
          clearMediaBlob()
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
  }

  const updateElement = (index, x1, y1, x2, y2, toolType) => {
    const updatedElement = createElement(index, x1, y1, x2, y2, toolType);
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedElement;
    setElements(elementsCopy);
  };

  const handleMouseDown = (e) => {
    console.log(toolType);
    const { clientX, clientY } = e;
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    const id = elements.length;
    if (toolType === "pencil") {
      setAction("sketching");
      setIsDrawing(true);

      const transparency = "1.0";
      const newEle = {
        clientX,
        clientY,
        transparency,
      };
      setPoints((state) => [...state, newEle]);

      context.lineCap = 5;
      context.moveTo(clientX, clientY);
      context.beginPath();
    } else {
      setAction("drawing");
      const element = createElement(id, clientX, clientY, clientX, clientY);

      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);
      console.log(elements);
    }
  };


  const handleMouseMove = (e) => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const { clientX, clientY } = e;

    if (action === "sketching") {
      if (!isDrawing) return;

      const transparency = points[points.length - 1].transparency;
      const newEle = { clientX, clientY, transparency };

      setPoints((state) => [...state, newEle]);
      var midPoint = midPointBtw(clientX, clientY);
      context.quadraticCurveTo(clientX, clientY, midPoint.x, midPoint.y);
      context.lineTo(clientX, clientY);
      context.stroke();
    } else if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];

      updateElement(index, x1, y1, clientX, clientY, toolType);
    }
  };

  const handleMouseUp = () => {
    if (action === "drawing") {
      const index = selectedElement.id;
      const { id, type, strokeWidth } = elements[index];
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
      updateElement(id, x1, y1, x2, y2, type, strokeWidth);
    } else if (action === "sketching") {
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      context.closePath();
      const element = points;
      setPoints([]);
      setPath((prevState) => [...prevState, element]); //tuple
      setIsDrawing(false);
    }
    setAction("none");
  };

  const rubWhiteboard = () => {
    setPath([]);
    setElements([]);
    setTextInput("");
  }

  function changeTextClor(color) {
    setTextColor(color)
  }

  function changeTextSize(size) {
    setTextSize(size)
  }

  function newLine() {
    setTextInput((textInput) => textInput + "\n")
  }

  return (
    <div className="App">
        <header>
          <div className="loader" id="loader">
            <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100}/>
          </div>
          <div className="pricing m-2">
              <div className="col-lg-10 col-md-10 mt-6 mt-lg-0 h-100">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>{title}</h3>
                    <div className="card p-2 shadow">
                      <h5 class="card-title text-center">White Board</h5>
                      <div>
                        <Swatch setToolType={setToolType} rubWhiteboard={rubWhiteboard} changeTextClor={changeTextClor} changeTextSize={changeTextSize} newLine={newLine} />
                      </div>
                      <canvas id='canvas' width={window.innerWidth} height={window.innerHeight - ( (window.innerHeight / 100) * 38)}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}>
                          Canvas
                      </canvas>
                    </div>
                    <div className="students-row">
                      {peers.map((peer, index) => {
                        console.log(peer)
                        let audioFlagTemp = true;
                        let videoFlagTemp = true;
                        if (userUpdate) {
                          userUpdate.forEach((entry) => {
                            if (peer && peer.peerID && peer.peerID === entry.id) {
                              console.log(entry)
                              audioFlagTemp = entry.audioFlag;
                              videoFlagTemp = entry.videoFlag;
                            }
                          });
                        }
                        return (
                          <div className=" col-xl-3 col-lg-4 col-md-6 col-sm-12">
                            <div className="m-2 pb-4 rounded card border-info p-2 shadow" style={{borderWidth:"small"}}>
                              <div key={peer.peerID}>
                                <h6>{peer.peerUser.name}</h6>
                                <Video peer={peer.peer} />
                                <ControlSmall>
                                  <ImgComponent id={peer.peerID} src={videoFlagTemp ? webcam : webcamoff} onClick={(e) => {
                                    socketRef.current.emit("videochange", { peerID :e.currentTarget.id});
                                  }}/>
                                  &nbsp;&nbsp;&nbsp;
                                  <ImgComponent id={peer.peerID} src={audioFlagTemp ? micunmute : micmute} onClick={(e) => {
                                    socketRef.current.emit("audiochange", { peerID :e.currentTarget.id});
                                  }}/>
                                </ControlSmall>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Card className="myVideoDiv">
                      <StyledVideo className="shadow" muted ref={userVideo} autoPlay playsInline  style={{maxWidth:"180px"}}/>
                      <div className="d-inline">
                        <button id="video" className="myVideoControls"
                          onClick={() => {
                            if (userVideo.current.srcObject) {
                              userVideo.current.srcObject.getTracks().forEach(function (track) {
                                if (track.kind === "video") {
                                  if (track.enabled) {
                                    socketRef.current.emit("change", [...userUpdate,{
                                      id: socketRef.current.id,
                                      videoFlag: false,
                                      audioFlag,
                                    }]);
                                    track.enabled = false;
                                    setVideoFlag(false);
                                  } else {
                                    socketRef.current.emit("change", [...userUpdate,{
                                      id: socketRef.current.id,
                                      videoFlag: true,
                                      audioFlag,
                                    }]);
                                    track.enabled = true;
                                    setVideoFlag(true);
                                  }
                                }
                              });
                            }
                          }}
                        ><i className={videoFlag ? "fas fa-video" : "fas fa-video-slash"}></i></button>
                        <button id="audio" className="myVideoControls"
                          onClick={() => {
                            if (userVideo.current.srcObject) {
                              userVideo.current.srcObject.getTracks().forEach(function (track) {
                                if (track.kind === "audio") {
                                  if (track.enabled) {
                                    socketRef.current.emit("change",[...userUpdate, {
                                      id: socketRef.current.id,
                                      videoFlag,
                                      audioFlag: false,
                                    }]);
                                    track.enabled = false;
                                    setAudioFlag(false);
                                  } else {
                                    socketRef.current.emit("change",[...userUpdate, {
                                      id: socketRef.current.id,
                                      videoFlag,
                                      audioFlag: true,
                                    }]);
                                    track.enabled = true;
                                    setAudioFlag(true);
                                  }
                                }
                              });
                            }
                          }}
                        ><i className={audioFlag ? "fas fa-microphone" : "fas fa-microphone-slash"}></i></button>
                        <button className="myVideoControls" onClick={chatShow}><i className="fas fa-comments"></i></button>
                        <button className="myVideoControls-danger" onClick={disconnectCall}><i className="fas fa-phone-slash"></i></button>
                      </div>
                      <div className="my-1">
                        <Button id="startRecordingBtn" size="sm" variant="warning" className="form-control" onClick={startRecording} disabled={status === 'recording'}>Record Your Class</Button>
                      </div>
                      <div className="mb-1">
                        <Button id="stopRecordingBtn" size="sm" variant="warning" className="form-control" onClick={stopRecording} disabled={status !== 'recording'}>Stop Your Recording</Button>
                      </div>
                    </Card>
                    <div id="chat-div" className="myChatDiv">
                      <div className="myChatHead" onClick={chatHide}>
                      <h6>Chat</h6>
                      </div>
                      <div className="chat-window">

                      </div>
                      <div className="chat-input d-inline">
                        <input placeholder="say something..."></input>
                        <button><i class="fa fa-paper-plane"></i></button>
                      </div>
                    </div>
                    <Card className="recording-div">
                      <Player srcBlob={mediaBlob} />
                      <div className="mb-1" >
                        <Button id="saveRecordingBtn" size="sm" variant="warning" className="form-control" onClick={saveRecording} disabled={!mediaBlob}>Save Your Recording</Button>
                      </div>
                    </Card>
                  </Card>
                </div>
              </div>
          </div>
        </header>
    </div>


  );
};

export default Room;