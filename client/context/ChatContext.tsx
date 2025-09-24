import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { baseUrl, getRequest, postRequest } from "@/utils/service";
import { io, Socket } from "socket.io-client";

// ===== Types =====
interface User {
    _id: string;
    username?: string;
    [key: string]: any; // allow extra fields
}

interface Chat {
    _id: string;
    members: string[];
    [key: string]: any;
}

interface Message {
    _id: string;
    chatId: string;
    senderId: string;
    text?: string;
    type?: string;
    createdAt?: string;
    [key: string]: any;
}

interface Notification {
    senderId: string;
    chatId?: string;
    isRead?: boolean;
    [key: string]: any;
}

interface ChatContextProps {
    userChats: Chat[] | null;
    isUserChatsLoading: boolean;
    userChatsError: any;
    updateCurrentChat: (chat: Chat) => void;
    currentChat: Chat | null;
    messages: Message[] | null;
    messagesError: any;
    socket: Socket | null;
    sendTextMessage: (
        textMessage: string,
        sender: User,
        currentChatId: string,
        setTextMessage: (val: string) => void
    ) => Promise<void>;
    sendMediaMessage: (
        file: File,
        user: User,
        chatId: string,
        type: string
    ) => Promise<void>;
    onlineUsers: any;
    potentialChats: User[] | null;
    createChat: (senderId: string, receiverId: string) => Promise<void>;
    notifications: Notification[];
    allUsers: User[];
    markAllNotificationsAsRead: (notifications: Notification[]) => void;
    markNotificationAsRead: (
        n: Notification,
        userChats: Chat[],
        user: User,
        notifications: Notification[]
    ) => void;
    markThisUserNotificationsAsRead: (
        thisUserNotifications: Notification[],
        notifications: Notification[]
    ) => void;
    newMessage: Message | null;
}

interface ChatContextProviderProps {
    children: ReactNode;
    user: User | null;
}

// ===== Context =====
export const ChatContext = createContext<ChatContextProps | undefined>(
    undefined
);

export const ChatContextProvider: React.FC<ChatContextProviderProps> = ({
                                                                            children,
                                                                            user,
                                                                        }) => {
    const [userChats, setUserChats] = useState<Chat[] | null>(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState<any>(null);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [messagesError, setMessagesError] = useState<any>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<any>(null);
    const [newMessage, setNewMessage] = useState<Message | null>(null);
    const [potentialChats, setPotentialChats] = useState<User[] | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // initialize socket
    useEffect(() => {
        const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // set online users
    useEffect(() => {
        if (!socket) return;

        socket.emit("addNewUser", user?._id);
        socket.on("getUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getUsers");
        };
    }, [socket, user]);

    // send message
    useEffect(() => {
        if (!socket || !newMessage) return;

        const recipientId = currentChat?.members.find((id) => id !== user?._id);
        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage, socket, currentChat, user]);

    // receive message and notifications
    useEffect(() => {
        if (!socket) return;

        socket.on("getMessage", (res: Message) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => (prev ? [...prev, res] : [res]));
        });

        socket.on("getNotification", (res: Notification) => {
            const isChatOpen = currentChat?.members.some(
                (Id) => Id === res.senderId
            );

            if (isChatOpen) {
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };
    }, [socket, currentChat]);

    // fetch messages when currentChat changes
    useEffect(() => {
        const getMessages = async () => {
            if (!currentChat?._id) return;
            const response = await getRequest(`${baseUrl}/messages/${currentChat._id}`);

            if (response.error) {
                return setMessagesError(response.error);
            }

            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    // fetch all users + potential chats
    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.error("Error fetching users:", response);
            }

            if (userChats) {
                const pChats = response?.filter((u: User) => {
                    if (user?._id === u._id) return false;

                    const isChatCreated = userChats?.some(
                        (chat) =>
                            chat.members[0] === u._id || chat.members[1] === u._id
                    );

                    return !isChatCreated;
                });

                setPotentialChats(pChats);
            }

            setAllUsers(response);
        };

        getUsers();
    }, [userChats, user]);

    // fetch user chats
    useEffect(() => {
        const getUserChats = async () => {
            setIsUserChatsLoading(true);
            setUserChatsError(null);

            if (user?._id) {
                const userId = user._id;
                const response = await getRequest(`${baseUrl}/chats/${userId}`);

                if (response.error) {
                    setUserChatsError(response);
                } else {
                    setUserChats(response);
                }
            }

            setIsUserChatsLoading(false);
        };

        getUserChats();
    }, [user, notifications]);

    // ===== Actions =====
    const updateCurrentChat = useCallback((chat: Chat) => {
        setCurrentChat(chat);
    }, []);

    const sendTextMessage = useCallback(
        async (
            textMessage: string,
            sender: User,
            currentChatId: string,
            setTextMessage: (val: string) => void
        ) => {
            if (!textMessage) return console.log("You must type something...");

            const response = await postRequest(
                `${baseUrl}/messages`,
                JSON.stringify({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                })
            );

            if (response.error) {
                return setMessagesError(response);
            }
            setNewMessage(response);
            setMessages((prev) => (prev ? [...prev, response] : [response]));
            setTextMessage("");
        },
        []
    );

    const sendMediaMessage = useCallback(
        async (file: File, user: User, chatId: string, type: string) => {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("chatId", chatId);
                formData.append("senderId", user._id);
                formData.append("type", type);
                formData.append("text", type);

                const data = await fetch(`${baseUrl}/messages`, {
                    method: "POST",
                    body: formData,
                }).then((res) => res.json());

                if (data._id) {
                    setNewMessage(data);
                    setMessages((prev) => (prev ? [...prev, data] : [data]));
                }
            } catch (error) {
                setMessagesError("Something went wrong!");
            }
        },
        []
    );

    const createChat = useCallback(async (senderId: string, receiverId: string) => {
        const response = await postRequest(
            `${baseUrl}/chats`,
            JSON.stringify({ senderId, receiverId })
        );

        if (response.error) {
            return console.log("Error creating chat:", response);
        }

        setUserChats((prev) => (prev ? [...prev, response] : [response]));
    }, []);

    const markAllNotificationsAsRead = useCallback(
        (notifications: Notification[]) => {
            const modifiedNotifications = notifications.map((n) => ({
                ...n,
                isRead: true,
            }));
            setNotifications(modifiedNotifications);
        },
        []
    );

    const markNotificationAsRead = useCallback(
        (
            n: Notification,
            userChats: Chat[],
            user: User,
            notifications: Notification[]
        ) => {
            // find chat to open
            const readChat = userChats.find((chat) => {
                const chatMembers = [user._id, n.senderId];
                return chat?.members.every((member) => chatMembers.includes(member));
            });

            // mark notification as read
            const modifiedNotifications = notifications.map((element) =>
                n.senderId === element.senderId ? { ...n, isRead: true } : element
            );

            updateCurrentChat(readChat!);
            setNotifications(modifiedNotifications);
        },
        [updateCurrentChat]
    );

    const markThisUserNotificationsAsRead = useCallback(
        (thisUserNotifications: Notification[], notifications: Notification[]) => {
            const modifiedNotifications = notifications.map((element) => {
                let notification: Notification = element;

                thisUserNotifications.forEach((n) => {
                    if (n.senderId === element.senderId) {
                        notification = { ...n, isRead: true };
                    }
                });

                return notification;
            });

            setNotifications(modifiedNotifications);
        },
        []
    );

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                updateCurrentChat,
                currentChat,
                messages,
                messagesError,
                socket,
                sendTextMessage,
                sendMediaMessage,
                onlineUsers,
                potentialChats,
                createChat,
                notifications,
                allUsers,
                markAllNotificationsAsRead,
                markNotificationAsRead,
                markThisUserNotificationsAsRead,
                newMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
