import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import generateUniqueId from 'generate-unique-id';
import { useUser } from '@clerk/clerk-react';
// ...existing code...
import Wrapper from '../components/Wrapper';



export function getUrlParams(
  url = window.location.href
) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}

export default function GolivePage() {
  const roomID = getUrlParams().get('roomID') || generateUniqueId({length:6});
  const {user, isLoaded} = useUser();
  const {fullName, primaryEmailAddress} = user || {};
  let role_str = getUrlParams(window.location.href).get('role') || 'Host';
  const role =
    role_str === 'Host'
      ? ZegoUIKitPrebuilt.Host
      : role_str === 'Cohost'
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  let sharedLinks = [];
  if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
    sharedLinks.push({
      name: 'Join as co-host',
      url:
        window.location.protocol + '//' + 
        window.location.host + window.location.pathname +
        '?roomID=' +
        roomID +
        '&role=Cohost',
    });
  }
  sharedLinks.push({
    name: 'Join as audience',
    url:
     window.location.protocol + '//' + 
     window.location.host + window.location.pathname +
      '?roomID=' +
      roomID +
      '&role=Audience',
  });
 // generate Kit Token
  const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APPID) as number;
  const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET as string;
  
  // Debug logging
  console.log('ZegoCloud Config:', {
    appID,
    serverSecret: serverSecret ? '***' + serverSecret.slice(-4) : 'undefined',
    serverSecretLength: serverSecret?.length,
    roomID,
    userID: primaryEmailAddress?.id || 'generated',
    userName: fullName || 'generated'
  });
  
  // Validate server secret format (should be 32 characters for MD5 hash)
  if (!serverSecret || serverSecret.length !== 32) {
    console.error('Invalid server secret format. Expected 32 characters, got:', serverSecret?.length);
  }
  
  const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, 
    serverSecret, roomID,  primaryEmailAddress?.id ||  generateUniqueId({length:6}),
    fullName || generateUniqueId({length:6})
  );


  // start the call
  let myMeeting = async (element:any) => {
    try {
      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      // start the call
      await zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            role,
          },
        },
        sharedLinks,
      });
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  // Wait for user to be loaded before rendering
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Wrapper>
      <div className="relative">
        
        <div
          className="myCallContainer"
          ref={myMeeting}
          style={{ width: '100vw', height: '100vh' }}
        ></div>
      </div>
    </Wrapper>
  );
}
