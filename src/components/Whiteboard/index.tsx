import React, { useEffect } from 'react';
import BackButton from '../BackButton';
import Wrapper from '../Wrapper';
import { ZegoSuperBoardManager } from 'zego-superboard-web';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

const White: React.FC = () => {
  const appID: number = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
  const serverUrl: string = import.meta.env.VITE_ZEGO_SERVER_URL;
  const userID: string = "12345";
  const roomID: string = "123455";
  const userName: string = "testUser";
  const token: string =
    "04AAAAAGgKqD4ADMwa8jQWmk4djQacIwCu42uCBf7HN5Js9ki7Mhck4AlMkRQEqye2KGE9AhbX0UJuVAF3FAVte+zWYit4d8tLtUrR2a4jcjCEnUjzs2PHbF6qxdhe+Y9pZ+j41SUlRTtv8atX/HcUoPDXJ9nlhhqf6JyJPMWGH9elIZC/vz/HBqCkApipG2GKYQ1BseIPZp1TzIUS24N4YxaTz6YBjtBvFPxtMq0iwdtTbnwIV4WlYw8P33RTKRrOButmr5+eAQ==";

  const zg = new ZegoExpressEngine(appID, serverUrl);
  const zegoSuperboard = ZegoSuperBoardManager.getInstance();

  const initSuperBoard = async () => {
    try {
      await zegoSuperboard.init(zg, {
        parentDomID: "superboard",
        appID,
        userID,
        token,
        isTestEnv: false  // Adding the required property
      });
      
      await zg.loginRoom(
        roomID, 
        token, 
        {
          userID,
          userName,
        },
        {userUpdate: true}
      );
      
      await zegoSuperboard.createWhiteboardView({
        name: "My learning platform", //Name of the whiteboard
        perPageWidth: 1600, 
        perPageHeight: 900, 
        pageCount: 1,
      });
    } catch (error) {
      console.error("Superboard initialization failed:", error);
    }
  };

  useEffect(() => {
    if (zegoSuperboard) {
      initSuperBoard();
    
    }
  }, [zegoSuperboard]);

  return (
    <Wrapper>
      <div className="app" style={{ position: 'relative' }}>
        <BackButton className="fixed top-5 left-5 z-50" />
        <div id="superboard"></div>
      </div>
    </Wrapper>
  );
};

export default White;