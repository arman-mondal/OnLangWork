import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import micmute from "../../teacher/assets/micmute.svg";
import micunmute from "../../teacher/assets/micunmute.svg";
import webcam from "../../teacher/assets/webcam.svg";
import webcamoff from "../../teacher/assets/webcamoff.svg";
import "../../teacher/class/onlineClass.css";
import {Form, Card} from "react-bootstrap";
import Loader from "react-js-loader";
import axios from 'axios';
import swal from 'sweetalert';
import configData from "../../config.json";
import {Editor } from '@tinymce/tinymce-react';
import Message from "../../components/chat/message";
import MyMessage from "../../components/chat/mymessage";
import { Button} from "react-bootstrap";

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
  opacity: 0.5;
`;

const StyledVideo = styled.video`
  height: auto;
  width: 100%;
`;


const StyledTeacherVideo = styled.video`
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

  if(props.counter == 0){
    return <StyledTeacherVideo playsInline autoPlay ref={ref} />;
  }else{
    return <StyledVideo playsInline autoPlay ref={ref}/>;
  }
};

const StudentRoom = (props) => {
  const [uploadedFiles,setupocadedfiles]=useState([])
  const userProfile = {
    name : `${props.user.firstname} ${props.user.lastname}`,
    isteacher : false,
  }
  function extractTextFromURL(url) {
    // Split the URL by '/'
    const parts = url.split('/');
    // Get the 7th part and split it by '?'
    const textPart = parts[6].split('?')[0];
    // Return the extracted text
    return textPart;
}

  const [chatToggler, setChatToggler] = useState(true);
  const [whiteboard, setWhiteboard] = useState();
  const [whiteboardDisabled, setWhiteboardDisabled] = useState(true);
  const[haveaccess,sethaveaccess]=useState("You don't have access to whiteboard")
  const [peers, setPeers] = useState([]);
  
  const[localchange,setlocalchange]=useState(true);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const [title, setTitle] = useState("Live Class");
  const [liveChat, setLiveChat] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;
  const classid = props.match.params.classid;
  const savedToken = localStorage.getItem('loginToken');
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };

  useEffect(() => {
    socketRef.current = io.connect(configData.SOCKET_SERVER_URL);
    createStream();
    getClassInfo();
    document.getElementById("loader").style.display = "none";
  }, []);

  function getClassInfo(){
    axios({
        method: "get",
        url:  configData.SERVER_URL + 'classes/getclassinfo/' + classid,
        headers: { 
          "authtoken" : localStorage.getItem('loginToken')
        },
    }).then(resp => {
        if(resp.data.code == 200){
          setTitle(`Live Class ${resp.data.classInfo.course.coursename} (${resp.data.classInfo.course.accent.accentname}) ${resp.data.classInfo.subcriptions.college.collegename}`)
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
          const peers = []; 
          users.forEach((user) => {
            const peer = createPeer(user.id, socketRef.current.id, stream,userProfile);
            peersRef.current.push({
              peerID: user.id,
              peerUser : user.userProfile,
              peer,
            });
            peers.push({
              peerID: user.id,
              peerUser : user.userProfile,
              peer,
            });
            setPeers(peers);
          });
        });
        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream, payload.userProfile);
          // peersRef.current.push({
          //   peerID: payload.callerID,
          //   peerUser : payload.userProfile,
          //   peer,
          // });
          const peerObj = {
            peer,
            peerUser : payload.userProfile,
            peerID: payload.callerID,
          };
          setPeers((peers) => [...peers, peerObj]);
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

        socketRef.current.on("audiochange", (studentId) => {
          if(studentId.peerID == socketRef.current.id){
            document.getElementById("audio").click();
          }
        });

        socketRef.current.on("videochange", (studentId) => {
          if(studentId.peerID == socketRef.current.id){
            document.getElementById("video").click();
          }
        });

        socketRef.current.on("whiteboardDisabled", (studentId) => {
          if(studentId.peerID == socketRef.current.id){
            setWhiteboardDisabled((whiteboardDisabled) => !whiteboardDisabled)
          }
         else{
          console.log("not working")
         }

        })

        
         
          
          
       

        socketRef.current.on("receive message", (newMessage) => {
          setLiveChat(preLiveChat => [...preLiveChat,newMessage]);
        });

        socketRef.current.on("room closed", () => {
          window.location.href = "/studentclasses";
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
  
  function toggleChat(){
    setChatToggler((preChatToggler) => !preChatToggler)
  }

  const sendMessage = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      socketRef.current.emit("sendmessage", { 
        mine : false,
        color : "#FCD21C",
        user : userProfile.name,
        message : e.currentTarget.value,
        image : props.user.image
      });
      setLiveChat(preLiveChat => [...preLiveChat,{ 
        mine : true,
        color : "#FCD21C",
        user : userProfile.name,
        message : e.currentTarget.value,
        image : props.user.image
      }]);
      e.currentTarget.value = ""
    }
  }
  
  const getValuees= async ()=>{
 const ff=await  socketRef.current.on("whiteboardChangeTransmit", (data) => {
console.log(ff)
      setWhiteboard(data);
      
      
      
      
      
      
                })
              }
  useEffect(() => {


    if(whiteboardDisabled===false){
      sethaveaccess("You have access to whiteboard")
      
    }
    if(whiteboardDisabled===true){
      sethaveaccess("You don't have access to whiteboard")
    }
      
     getValuees();

     const gett=()=>{
      axios.get(configData.SERVER_URL+'classes/live-class-files/'+roomID)
      .then((res)=>{
        const data=res.data.classes
       
       setupocadedfiles(data)
       
      })
      .catch((err)=>{console.log(err)
      }
      )
    }
    gett()
    
    return () => {
      socketRef.current.on("whiteboardFileUploadedTransmit", (data) => {
        axios.get(configData.SERVER_URL+'classes/live-class-files/'+roomID)
       .then((res)=>{
        console.log(res)
       setupocadedfiles(res.data.classes)
        return
       })
       .catch((err)=>{console.log(err)
       return})
       
           })
  };
   
          
        
  }, [whiteboard])
  const handlewhiteboardchange = (data) => {
if(whiteboardDisabled){
return
}
if(whiteboardDisabled===false){
  socketRef.current.emit("whiteboardChanged",data)
  setWhiteboard(data)

}

  }

  const handleFilePicker = (callback, value, meta) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = function () {
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        const id = 'blobid' + (new Date()).getTime();
        const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
        const base64 = reader.result.split(',')[1];
        const blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);

        callback(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };



  return (
    <div className="App">
      <header>
        <div className="loader" id="loader">
          <Loader type="spinner-circle" bgColor={"#ffffff"} title={"LOADING..."} color={'#ffffff'} size={100}/>
        </div>
        <div style={{ 
            width: '200px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            margin: '20px auto',
            fontFamily: 'Arial, sans-serif',
            position:'absolute',
            zIndex:10,
            right:15,
            height:'300px',
            bottom:150,display:'flex',
            flexDirection:'column'
          
        }}>
            <div style={{ 
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderBottom: '1px solid #ccc',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '5px'
            }}>
                  
  <input id="fileupload" type="file" style={{
    display:'none'
  }} onChange={async(e)=>{
    const file=e.target.files[0]
    const formData=new FormData()
    formData.append('uuid',roomID)
    formData.append('type','student')
    formData.append('file',file)
    formData.append('type_id',props.user.studentid)
    await axios.post(configData.SERVER_URL+'classes/upload-file',formData)
    .then((res)=>{
      const data=res.data.url;
      socketRef.current.emit("whiteboardFileUploaded",data);
    })
    .catch((err)=>{
      swal.fire({
        icon:'error',
        text:'Failed'
      })
    })

  }} />
  <Button style={{
    cursor:'pointer'
  }} onClick={()=>{
document.getElementById('fileupload').click()
  }}  >Upload</Button>
            </div>
            <div style={{ padding: '10px' ,width:'100%' ,display:'flex',flexDirection:'column',overflowY:'auto'}}>
              
                {uploadedFiles.length>0 &&  uploadedFiles.map((item)=>(
  <a className="" href={item.filename} style={{fontSize:15 ,width:'100%',padding:10}} >{extractTextFromURL(item.filename)}</a>

))}
                {/* Add more messages as needed */}
            </div>
        </div>



        <div className="pricing m-2">
            <div className="container">
              <div className="col-lg-10 col-md-10 mt-6 mt-lg-0 h-100">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>{title}</h3>
                    <div className="card p-2 shadow">
                      <h5 class="card-title text-center">White Board</h5>
                      <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                        <span>{haveaccess}   </span>
                       
                        <Editor
      apiKey='auackic3jk567ycr3euzz5z205r6pgfcrshj7hzk4pvfdtjl'

                            value={whiteboard}
                            disabled={whiteboardDisabled}
                            initialValue=""
                            init={{
                              selector: 'textarea#file-picker',
                              plugins: 'image code',
                              toolbar: 'undo redo | link image | code',
                              image_title: true,
                              automatic_uploads: true,
                              file_picker_types: 'image',
                              file_picker_callback: handleFilePicker,
                              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            }}

                            onEditorChange={(content, editor) => {
                              handlewhiteboardchange(content)

                          }}
                        />
                      </div>
                    </div>
                    <div className="students-row">
                      {peers.map((peer, index) => {
                        let audioFlagTemp = true;
                        let videoFlagTemp = true;
                        if (userUpdate) {
                          userUpdate.forEach((entry) => {
                            if (peer && peer.peerID && peer.peerID === entry.id) {
                              audioFlagTemp = entry.audioFlag;
                              videoFlagTemp = entry.videoFlag;
                            }
                          });
                        }
                          return (
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                              {
                                peer.peerUser.isteacher ?
                                  <div className="m-2 pb-4 rounded card border-danger p-2 shadow" style={{borderWidth:"medium"}}>
                                    <div key={peer.peerID} >
                                      <h6>{peer.peerUser.name}</h6>
                                      <Video peer={peer.peer} counter={index} />
                                      <ControlSmall>
                                        <ImgComponentSmall src={videoFlagTemp ? webcam : webcamoff} />
                                        &nbsp;&nbsp;&nbsp;
                                        <ImgComponentSmall src={audioFlagTemp ? micunmute : micmute} />
                                      </ControlSmall>
                                    </div>
                                  </div>

                                  :
                                  <div className="m-2 pb-4 rounded card border-info p-2 shadow" style={{borderWidth:"small"}}>
                                    <div key={peer.peerID} >
                                      <h6>{peer.peerUser.name}</h6>
                                      <Video peer={peer.peer} counter={index} />
                                      <ControlSmall>
                                        <ImgComponentSmall src={videoFlagTemp ? webcam : webcamoff} />
                                        &nbsp;&nbsp;&nbsp;
                                        <ImgComponentSmall src={audioFlagTemp ? micunmute : micmute} />
                                      </ControlSmall>
                                    </div>
                                  </div>
                              }
                            </div>
                          );
                      })}
                    </div>
                    <Card className="myVideoDiv border-warning" style={{borderWidth:"medium"}}>
                      <StyledVideo className="shadow" muted ref={userVideo} autoPlay playsInline  style={{maxWidth:"180px"}}/>
                      <div className="d-inline">
                      <button className="btn  rounded-full hover:bg-gray-800" onClick={()=>{
                          socketRef.current.emit("whiteboardAccessRequest",{
                            peerId: socketRef.current.id,
                          }
                          );
                        }}><img src={"https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/254000/35-512.png"} height="24" width="24" /></button>
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
                        <button className="myVideoControls" onClick={toggleChat}><i className="fas fa-comments"></i></button>
                      </div>
                      
                    </Card>
                    
                    <div id="chat-div" className="myChatDiv card shadow border-warning" style={{borderWidth:"medium"}}>
                      <div class="card-header bg-warning text-light" onClick={toggleChat}>
                        <strong>Live Chat</strong>
                      </div>
                      { chatToggler ? 
                        <>
                          <div id="card-body" class="card-body overflow-auto" style={{maxHeight:"20rem"}}>

                            {liveChat.map((message, index) => (
                              <>
                              { message.mine ? 
                                <MyMessage message={{
                                  url : message.image,
                                  message : message.message,
                                  color : message.color
                                }}/>
                              :
                                <Message message={{
                                  url : message.image,
                                  message : message.message,
                                  color : message.color
                                }}/>
                              }
                              </>
                            ))}

                          </div>
                          <div id="card-footer" class="card-footer">
                              <input type="text"  style={{maxWidth : "100%"}} placeholder="Enter your message" onKeyDown={sendMessage}/>
                          </div>
                        </>
                        : <></>
                      }

                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </header>
    </div>


  );
};

export default StudentRoom;

