interface PeerStateChangedHandler {
    (peerState: {
        socketId: string;
        info: any;
        isAudioOn: boolean;
        isVideoOn: boolean;
        isScreenShareOn: boolean;
        audioStream: MediaStream | null;
        videoStream: MediaStream | null;
        screenShareStream: MediaStream | null;
        isPolite: boolean;
    }[]): void;
}
export interface peerState {
    socketId: string;
    info: any;
    isAudioOn: boolean;
    isVideoOn: boolean;
    isScreenShareOn: boolean;
    audioStream: MediaStream | null;
    videoStream: MediaStream | null;
    screenShareStream: MediaStream | null;
    isPolite: boolean;
}
export interface FileState {
    fileId: string;
    totalSize: number;
    completedSize: number;
    progress: number;
    fileName: string;
    transferSpeed: number;
    lastTimeStamp: number;
    peerId: string;
    receivedArrayBuffer: any[];
}
export declare class WebrtcBase {
    private _iceConfiguration;
    private _audioTrack;
    private _videoTrack;
    private _screenShareTrack;
    private _peerConnections;
    private _peers_ids;
    private _peersInfo;
    private _politePeerStates;
    private _remoteScreenShareTrackIds;
    private _offferMakingStatePeers;
    private _fileStates;
    private _fileTransferingDataChennels;
    private _fileTransferingPeers;
    private _fileSendingReqCallbacks;
    private _pendingFiles;
    private _fileTransferingFileReaders;
    private _remoteAudioStreams;
    private _remoteVideoStreams;
    private _remoteScreenShareStreams;
    private _rtpVideoSenders;
    private _rtpScreenShareSenders;
    private _rtpAudioSenders;
    private _isAudioMuted;
    private _isVideoMuted;
    private _isScreenShareMuted;
    private _serverFn;
    private _my_connid;
    private _dataChannels;
    private _onCameraVideoStateChanged;
    private _onScreenShareVideoStateChanged;
    private _onAudioStateChanged;
    private _onPeerStateChanged;
    private _onDataChannelMsgCallback;
    private _onFileStateChanged;
    private _onFileTransferCompleted;
    private _onError;
    constructor(my_connid: string, iceConfiguration: RTCConfiguration, serverFn: Function);
    createConnection(connid: string, politePeerState: boolean, extraInfo?: any | null): Promise<void>;
    _createOffer(connid: string): Promise<void>;
    onSocketMessage(message: any, from_connid: string, extraInfo?: any | null): Promise<void>;
    _isConnectionAlive(connenction: RTCPeerConnection): boolean;
    closeConnection(connid: string): void;
    onPeerStateChange(fn: PeerStateChangedHandler): void;
    sendDataChannelMsg(conId: string, msg: any): void;
    onDataChannelMsg(fn: Function): void;
    onFileSendingReq(fn: (name: string, conId: string) => boolean): void;
    onFileStateChange(fn: (fileState: FileState) => void): void;
    _emitFileStateChange(fileID: string): void;
    onFileTransferCompleted(fn: (fileState: FileState, objectURl: string) => void): void;
    _emitFileTransferCompleted(fileState: FileState, objectURl: string): void;
    sendFile(to: string, file: File): void;
    _sendFileUsingDataChannel(conId: string, data: FileState, chunkSize?: number): void;
    _emitDataChannelMsgCallback(conId: string, msg: any): void;
    _updatePeerState(): void;
    getAllPeerDetails(): {
        socketId: string;
        info: any;
        isAudioOn: boolean;
        isVideoOn: boolean;
        isScreenShareOn: boolean;
        audioStream: MediaStream | null;
        videoStream: MediaStream | null;
        screenShareStream: MediaStream | null;
        isPolite: boolean;
    }[];
    getPeerDetailsById(connid: string): {
        socketId: string;
        info: any;
        isAudioOn: boolean;
        isVideoOn: boolean;
        isScreenShareOn: boolean;
        audioStream: MediaStream | null;
        videoStream: MediaStream | null;
        screenShareStream: MediaStream | null;
        isPolite: boolean;
    } | null;
    _AlterAudioVideoSenders(track: MediaStreamTrack, rtpSenders: any): void;
    _RemoveAudioVideoSenders(rtpSenders: any): void;
    _ClearCameraVideoStreams(_rtpVideoSenders: any): void;
    _ClearScreenVideoStreams(_rtpScreenSenders: any): void;
    startCamera(cameraConfig?: {
        video: {
            width: number;
            height: number;
        };
        audio: boolean;
    }): Promise<void>;
    _emitCameraVideoState(state: boolean): void;
    onCameraVideoStateChange(fn: (state: boolean, stream: MediaStream | null) => void): void;
    _emitScreenShareState(state: boolean): void;
    onScreenShareVideoStateChange(fn: (state: boolean, stream: MediaStream | null) => void): void;
    _emitAudioState(state: boolean): void;
    onAudioStateChange(fn: (state: boolean, stream: MediaStream | null) => void): void;
    stopCamera(): void;
    toggleCamera(): Promise<void>;
    _startScreenShare(): Promise<void>;
    startScreenShare(screenConfig?: {
        video: boolean;
        audio: boolean;
    }): Promise<void>;
    stopScreenShare(): void;
    toggleScreenShare(): Promise<void>;
    startAudio(): Promise<void>;
    stopAudio(): Promise<void>;
    toggleAudio(): Promise<void>;
    isLocalAudioOn(): boolean;
    isLocalVideoOn(): boolean;
    isLocalScreenShareOn(): boolean;
    onError(fn: Function): void;
    _emitError(error: any): void;
}
export {};
