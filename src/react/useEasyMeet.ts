import { useState, useCallback } from 'react';
import { WebrtcBase } from 'index';

export const useEasyMeet = () => {
    let e = new WebrtcBase("jj", {iceServers:[{urls:"stun:stun.l.google.com:19302"}]},()=>{
        
    });
    const [easyMeet, setEasyMeet] = useState<any>();
    const initEasyMeet = useCallback(() => {
        // if (easyMeet) {
        //     return;
        // }
        // const easyMeet = window.EasyMeet;
        // if (!easyMeet) {
        //     return;
        // }  
        // setEasyMeet(easyMeet);
    }, [easyMeet]);
    return [easyMeet, initEasyMeet];
};
