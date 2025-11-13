"use client";
import { useEffect, useState } from "react";
import ChatForm from "@/components/ChatForm";
import Image from "next/image";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/socketClient";

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Array<{sender: string; message: string}>>([]);
  const [username, setUsername] = useState('');
  useEffect(() => {
  // Nhận tin nhắn chat bình thường
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

  // Nhận thông báo khi có người tham gia phòng
    socket.on("user_joined", (message) => {
      setMessages((prev) => [
      ...prev,
      { sender: "system", message },
    ]);
     });

  // Cleanup khi component unmount hoặc reload
    return () => {
      socket.off("user_joined");
      socket.off("message");
  };
}, []);

  const handleJoinRoom = () => {
    if(roomId && username){
      socket.emit("joinRoom", { room: roomId, username:username });
    }
    setJoined(true);
    // Here you would typically also notify the server about joining the room
  };

  const handleSendMessage = (message: string) => {
    const data ={roomId, message, sender: username};
    setMessages((prev) => [...prev, { sender: username, message }]);
    socket.emit("message", data);
    
  };
  return (
    <div className="flex mt-24 justify-center w-full">
      {!joined ? (
        <div className="w-full max-w-3xl mx-auto flex-col flex items-center">
          <h1 className="mb-4 text-2xl font-bold">Join a Room</h1>

          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />

          <input
            type="text"
            placeholder="Enter room name"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-64 px-4 py-2 mb-4 border-2 rounded-lg"
          />

          <button
            onClick={ handleJoinRoom }
            className="px-4 py-2 text-white bg-blue-500 rounded-lg"
          >
            Join
          </button>
        </div>
      ) : (
             <div className="w-full max-w-3xl mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Room: {roomId}</h1>
      <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
        {messages.map((msg, index) => (
          <ChatMessage 
             key={index} 
             sender={msg.sender} 
             message={msg.message} 
             isOwnMessage={msg.sender === username}
          />
        ))}
      </div>
      <ChatForm onSendMessage={handleSendMessage}/>
     </div>
         
      )}
      

    </div>
  );
}
