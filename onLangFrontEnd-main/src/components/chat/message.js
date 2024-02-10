
import React from 'react';
import configData from '../../config.json';
 
const Message = ({message}) => {
    let style = {
        borderRadius: "15px", 
        backgroundColor: message.color, 
        color : "white"
    }
  return <div class="d-flex flex-row justify-content-start mb-4">
            <img src={ configData.SERVER_URL_ASSETS + message.url}
                alt="avatar 1" style={{width: "15px", height: "100%"}}/>
            <div class="p-2 ms-2" style={style}>
                <p class="small mb-0">{message.message}</p>
            </div>
        </div>;
}
 
export default Message;