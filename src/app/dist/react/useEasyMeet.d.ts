import { MutableRefObject } from "react";
import { FileState, peerState, WebrtcBase } from "../index";
export interface easyMeetInterface {
    webRTCBaseRef: MutableRefObject<WebrtcBase | null>;
    error: {
        type: "sys-error" | "webrtc-error";
        message: string;
    } | null;
    onSocketMessage: (message: string, from_connid: string, extraInfo: any | null) => Promise<void>;
    startCamera: (cameraConfig?: {
        video: {
            width: number;
            height: number;
        };
    }) => Promise<void>;
    stopCamera: Function;
    startScreenShare: (screenConfig?: {
        video: {
            width: number;
            height: number;
        };
        audio: boolean;
    }) => Promise<void>;
    stopScreenShare: Function;
    toggleCamera: (cameraConfig?: {
        video: boolean | {
            width: number;
            height: number;
        };
    }) => Promise<void>;
    toggleScreenShare: (screenConfig?: {
        video: boolean | {
            width: number;
            height: number;
        };
        audio: boolean;
    }) => Promise<void>;
    startAudio: Function;
    stopAudio: Function;
    toggleAudio: () => Promise<void>;
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
    newDataChannelMsg: {
        from: string;
        msg: string;
    } | null;
    fileSharingCompleted: {
        file: FileState;
        objectUrl: string;
    } | null;
    fileSharingState: FileState | null;
    isSystemReady: boolean;
    peers: peerState[];
    sendDataChannelMsg: (msg: string, toID: string) => void;
    sendFile: (to: string, file: File) => void;
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
 * newDataChannelMsg: {from: string; msg: string} | null
 * fileSharingCompleted: {file:FileState , objectUrl: string} | null
 * fileSharingState: FileState | null
 * isSystemReady: boolean
 * }
 */
export declare const useEasyMeet: (selfID: string, iceServers: any[], socketMsgFn: Function, onFileSendingReq?: (name: string, conId: string) => boolean) => easyMeetInterface;
