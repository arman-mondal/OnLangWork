
import React from 'react';
import configData from '../../config.json';
 
const MyMessage = ({message}) => {
    let style = {
        borderRadius: "15px", 
        backgroundColor: message.color, 
        color : "white"
    }
  return <div class="d-flex flex-row justify-content-end mb-4">
            <div class="p-2 me-2 border" style={style}>
                <p class="small mb-0">{message.message}</p>
            </div>
            <img src={ configData.SERVER_URL_ASSETS + message.url} alt="avatar 1" style={{width: "15px", height: "100%"}}/>
        </div>;
}
 
export default MyMessage;