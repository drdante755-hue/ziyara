import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

let socket: Socket | null = null

export const getSocketClient = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = (): void => {
  const socketInstance = getSocketClient()
  if (!socketInstance.connected) {
    socketInstance.connect()
  }
}

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect()
  }
}

interface TicketStatusChangePayload {
  ticketId: string
  status: string
  changedBy: string
  changedByName?: string
}

export const emitTicketStatusChange = (payload: TicketStatusChangePayload): void => {
  const socketInstance = getSocketClient()
  if (!socketInstance.connected) {
    socketInstance.connect()
  }
  socketInstance.emit("ticket:status-change", payload)
}

export default emitTicketStatusChange
