import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FileState, peerState, WebrtcBase } from "./webrtc";

export interface easyMeetInterface {
  webRTCBaseRef: MutableRefObject<WebrtcBase | null>;
  error: { type: "sys-error" | "webrtc-error"; message: string } | null;
  onSocketMessage: Function;
  startCamera: Function;
  stopCamera: Function;
  startScreenShare: Function;
  stopScreenShare: Function;
  toggleCamera: Function;
  toggleScreenShare: Function;
  startAudio: Function;
  stopAudio: Function;
  toggleAudio: Function;
  isLocalAudioOn: () => boolean | undefined;
  isLocalVideoOn: () => boolean | undefined;
  isLocalScreenShareOn: () => boolean | undefined;
  joinExistingPeer: Function;
  joinNewPeer: Function;
  leavePeer: Function;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenShareOn: boolean;
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
  screenShareStream: MediaStream | null;
  dataChannelMsg: { from: string; msg: string } | null;
  fileSharingCompleted: { file: FileState; objectUrl: string } | null;
  fileSharingState: FileState | null;
  isSystemReady: boolean;
}

/**
 * This hook provides the necessary methods and states for easy-to-use webrtc functionality. It is designed to be used in react applications. The hook returns all the necessary states and methods for webrtc functionality.
 * @param selfID The id of the current user.
 * @param iceServers The list of ice servers to be used for webrtc.
 * @param socketMsgFn The function to be called when a webrtc system need to send a message.
 * @param onFileSendingReq The callback function to decide whether to allow or deny a file sending request.
 * @returns {
 * webRTCBaseRef: MutableRefObject<WebrtcBase | null>
 * error: {type:"sys-error"| "webrtc-error", message:string} | null
 * onSocketMessage: Function
 * startCamera: Function
 * stopCamera: Function
 * startScreenShare: Function
 * stopScreenShare: Function
 * toggleCamera: Function
 * toggleScreenShare: Function
 * startAudio: Function
 * stopAudio: Function
 * toggleAudio: Function
 * isLocalAudioOn: () => boolean | undefined
 * isLocalVideoOn: () => boolean | undefined
 * isLocalScreenShareOn: () => boolean | undefined
 * joinExistingPeer: Function
 * joinNewPeer: Function
 * leavePeer: Function
 * isAudioOn: boolean
 * isVideoOn: boolean
 * isScreenShareOn: boolean
 * audioStream: MediaStream | null
 * videoStream: MediaStream | null
 * screenShareStream: MediaStream | null
 * dataChannelMsg: {from: string; msg: string} | null
 * fileSharingCompleted: {file:FileState , objectUrl: string} | null
 * fileSharingState: FileState | null
 * isSystemReady: boolean  
 * }
 */
export const useEasyMethods = (
  selfID: string,
  iceServers: any[],
  socketMsgFn: Function,
  onFileSendingReq: (name: string, conId: string) => boolean = () => true
): easyMeetInterface => {
  const webRTCBaseRef = useRef<WebrtcBase | null>(null);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [peers, setPeers] = useState<peerState[]>([]);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [isScreenShareOn, setIsScreenShareOn] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] =
    useState<MediaStream | null>(null);
  const [dataChannelMsg, setDataChennelMsg] = useState<{
    from: string;
    msg: string;
  } | null>(null);
  const [fileSharingState, setFileSharingState] = useState<FileState | null>(
    null
  );
  const [fileSharingCompleted, setFileSharingCompleted] = useState<{
    file: FileState;
    objectUrl: string;
  } | null>(null);
  const [error, setError] = useState<{
    type: "sys-error" | "webrtc-error";
    message: string;
  } | null>(null);

  //init webrtc system
  useEffect(() => {
    if (!webRTCBaseRef.current) {
      webRTCBaseRef.current = new WebrtcBase(
        selfID,
        { iceServers: iceServers },
        socketMsgFn
      );
      webRTCBaseRef.current.onError((err) => {
        setError({ type: "webrtc-error", message: err });
      });
      webRTCBaseRef.current.onPeerStateChange((peersState: peerState[]) => {
        setPeers(peersState);
      });
      webRTCBaseRef.current.onAudioStateChange(
        (state: boolean, stream: MediaStream | null) => {
          setIsAudioOn(state);
          setAudioStream(stream);
        }
      );
      webRTCBaseRef.current.onCameraVideoStateChange(
        (state: boolean, stream: MediaStream | null) => {
          setIsVideoOn(state);
          setVideoStream(stream);
        }
      );
      webRTCBaseRef.current.onScreenShareVideoStateChange(
        (state: boolean, stream: MediaStream | null) => {
          setIsScreenShareOn(state);
          setScreenShareStream(stream);
        }
      );
      webRTCBaseRef.current.onDataChannelMsg((fromId, msg) => {
        setDataChennelMsg({ from: fromId, msg: msg });
      });
      webRTCBaseRef.current.onFileSendingReq((name, conId) => {
        return onFileSendingReq(name, conId);
      });
      webRTCBaseRef.current.onFileStateChange((fileState) => {
        setFileSharingState(fileState);
      });
      webRTCBaseRef.current.onFileTransferCompleted((fileState, objectURl) => {
        setFileSharingCompleted({ file: fileState, objectUrl: objectURl });
      });

      setIsSystemReady(true);
      console.log("Webrtc System is ready");
    }
  }, [iceServers, selfID, socketMsgFn, onFileSendingReq]);

  // all functions and callbacks
  const joinExistingPeer = useCallback(
    (peerID: string, extraData: any = null) => {
      if (webRTCBaseRef.current) {
        webRTCBaseRef.current.createConnection(peerID, false, extraData);
      } else {
        setError({ type: "sys-error", message: "Webrtc System is not ready" });
      }
    },
    [webRTCBaseRef]
  );
  const joinNewPeer = useCallback(
    (peerID: string, extraData: any = null) => {
      if (webRTCBaseRef.current) {
        webRTCBaseRef.current.createConnection(peerID, true, extraData);
      } else {
        setError({ type: "sys-error", message: "Webrtc System is not ready" });
      }
    },
    [webRTCBaseRef]
  );
  const leavePeer = useCallback(
    (peerID: string) => {
      if (webRTCBaseRef.current) {
        webRTCBaseRef.current.closeConnection(peerID);
      } else {
        setError({ type: "sys-error", message: "Webrtc System is not ready" });
      }
    },
    [webRTCBaseRef]
  );

  const onSocketMessage = useCallback(
    (message: string, from_connid: string, extraInfo: any = null) => {
      if (webRTCBaseRef.current) {
        webRTCBaseRef.current.onSocketMessage(message, from_connid, extraInfo);
      } else {
        setError({ type: "sys-error", message: "Webrtc System is not ready" });
      }
    },
    [webRTCBaseRef]
  );

  const startCamera = useCallback(
    async (
      cameraConfig = { video: { width: 640, height: 480 }, audio: false }
    ) => {
      if (webRTCBaseRef.current) {
        await webRTCBaseRef.current.startCamera(cameraConfig);
      } else {
        setError({ type: "sys-error", message: "Webrtc System is not ready" });
      }
    },
    [webRTCBaseRef]
  );

  const stopCamera = useCallback(() => {
    if (webRTCBaseRef.current) {
      webRTCBaseRef.current.stopCamera();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const startScreenShare = useCallback(async () => {
    if (webRTCBaseRef.current) {
      await webRTCBaseRef.current.startScreenShare();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const stopScreenShare = useCallback(async () => {
    if (webRTCBaseRef.current) {
      webRTCBaseRef.current.stopScreenShare();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const toggleCamera = useCallback(async () => {
    if (webRTCBaseRef.current) {
      await webRTCBaseRef.current.toggleCamera();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const toggleScreenShare = useCallback(async () => {
    if (webRTCBaseRef.current) {
      await webRTCBaseRef.current.toggleScreenShare();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const startAudio = useCallback(async () => {
    if (webRTCBaseRef.current) {
      await webRTCBaseRef.current.startAudio();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const stopAudio = useCallback(() => {
    if (webRTCBaseRef.current) {
      webRTCBaseRef.current.stopAudio();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const toggleAudio = useCallback(async () => {
    if (webRTCBaseRef.current) {
      await webRTCBaseRef.current.toggleAudio();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const isLocalAudioOn = useCallback(() => {
    if (webRTCBaseRef.current) {
      return webRTCBaseRef.current.isLocalAudioOn();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const isLocalVideoOn = useCallback(() => {
    if (webRTCBaseRef.current) {
      return webRTCBaseRef.current.isLocalVideoOn();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  const isLocalScreenShareOn = useCallback(() => {
    if (webRTCBaseRef.current) {
      return webRTCBaseRef.current.isLocalScreenShareOn();
    } else {
      setError({ type: "sys-error", message: "Webrtc System is not ready" });
    }
  }, [webRTCBaseRef]);

  return {
    webRTCBaseRef,
    error,
    onSocketMessage,
    startCamera,
    stopCamera,
    startScreenShare,
    stopScreenShare,
    toggleCamera,
    toggleScreenShare,
    startAudio,
    stopAudio,
    toggleAudio,
    isLocalAudioOn,
    isLocalVideoOn,
    isLocalScreenShareOn,
    joinExistingPeer,
    joinNewPeer,
    leavePeer,
    isAudioOn,
    isVideoOn,
    isScreenShareOn,
    audioStream,
    videoStream,
    screenShareStream,
    dataChannelMsg,
    fileSharingCompleted,
    fileSharingState,
    isSystemReady,
  };
};
