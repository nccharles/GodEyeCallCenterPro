import { useEffect, useRef } from 'react';

const VideoContainer = ({ stream, isLocalStream, isOnCall }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);


    return (
        <video
            className={`rounded border w-[80px] ${isLocalStream && isOnCall ? 'w-[20px] h-auto absolute border-purple-500 border-2' : ''}`}
            ref={videoRef}
            style={{display: "none"}}
            width="100px"
            height="100px"
            autoPlay
            muted={isLocalStream}
        />
    );
};

export default VideoContainer;
