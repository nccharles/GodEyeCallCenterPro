import React, {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { Peer, MediaConnection } from "peerjs";
import { baseUrl, getRequest } from "@/utils/service";
import { ICE_SERVERS } from "@/hooks/iceServers";

// Types
interface User {
    _id: string;
    [key: string]: any; // in case user has extra fields
}

interface CallInfo {
    caller: User;
    recipient: User;
    isRinging: boolean;
}

interface CallContextProps {
    ongoingCall: CallInfo | null;
    handleCall: (receiver: User) => Promise<void>;
    handleEndCall: () => void;
    toggleMute: (isMicOff: boolean) => void;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    handleAccept: () => Promise<void>;
}

interface CallContextProviderProps {
    children: ReactNode;
    user: User | null;
}

// Context
export const CallContext = createContext<CallContextProps | undefined>(
    undefined
);

export const CallContextProvider: React.FC<CallContextProviderProps> = ({
                                                                            children,
                                                                            user,
                                                                        }) => {
    const [ongoingCall, setOngoingCall] = useState<CallInfo | null>(null);
    const [currentCall, setCurrentCall] = useState<MediaConnection | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const peerInstance = useRef<Peer | null>(null);

    const getMediaStream = useCallback(async (): Promise<MediaStream | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true,
            });

            if (!stream || !stream.active || stream.getAudioTracks().length === 0) {
                console.error("Stream is inactive or no audio tracks found.");
                return null;
            }

            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error("Failed to get media stream:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        if (!peerInstance.current) {
            peerInstance.current = new Peer(user._id, {
                config: {
                    iceServers: ICE_SERVERS,
                },
            });
        }

        peerInstance.current.on("call", async (call: MediaConnection) => {
            if (currentCall) {
                console.log("Already in a call!");
                call.close();
                return;
            }
            setCurrentCall(call);
            const caller = await getRequest(`${baseUrl}/users/find/${call.peer}`);
            setOngoingCall({ caller, recipient: user, isRinging: true });
        });
    }, [user, currentCall]);

    const handleAccept = useCallback(async () => {
        if (!currentCall) return;

        const stream = await getMediaStream();
        if (!stream) return;

        setLocalStream(stream);
        currentCall.answer(stream);

        currentCall.on("stream", (rStream: MediaStream) => {
            setRemoteStream(rStream);
        });
        setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));

        currentCall.on("close", () => {
            handleEndCall();
        });
    }, [currentCall, getMediaStream]);

    const handleCall = useCallback(
        async (receiver: User) => {
            if (currentCall) {
                console.log("Already in a call!");
                return;
            }

            const mediaStream = await getMediaStream();
            if (!mediaStream) return;

            setLocalStream(mediaStream);
            setOngoingCall({ caller: user as User, recipient: receiver, isRinging: true });
            const call = peerInstance.current?.call(receiver._id, mediaStream);
            if (!call) return;
            setCurrentCall(call);

            call.on("stream", (rStream: MediaStream) => {
                setRemoteStream(rStream);
                setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));
            });

            call.on("close", () => {
                console.log("Call ended");
                handleEndCall();
            });
        },
        [currentCall, getMediaStream, user]
    );

    const handleEndCall = useCallback(() => {
        if (currentCall) {
            currentCall.close();
            setCurrentCall(null);
        }

        // Stop all tracks in the media stream
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }

        // Reset state
        setOngoingCall(null);
        setCurrentCall(null);
        setLocalStream(null);
        setRemoteStream(null);

        // Destroy the Peer instance
        if (peerInstance.current) {
            peerInstance.current.destroy();
            peerInstance.current = null;
        }
    }, [currentCall, localStream]);

    const toggleMute = (isMicOff: boolean) => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach((track) => (track.enabled = isMicOff));
        }
    };

    return (
        <CallContext.Provider
            value={{
                ongoingCall,
                handleCall,
                handleEndCall,
                toggleMute,
                localStream,
                remoteStream,
                handleAccept,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};
