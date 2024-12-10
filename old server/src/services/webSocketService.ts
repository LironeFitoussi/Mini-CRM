import { Server } from 'socket.io';
import axios from 'axios';

class WebSocketService {
  private io: Server;
  private whatsappConnected: boolean = false;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.initializeSocketEvents();
  }

  private initializeSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('check_whatsapp_status', async () => {
        try {
          const response = await axios.get(`${process.env.PYTHON_WHATSAPP_ENDPOINT}/whatsapp_status`);
          
          if (response.data.connected) {
            this.whatsappConnected = true;
            socket.emit('whatsapp_status', { connected: true });
          } else {
            // Request QR code generation
            const qrResponse = await axios.get(`${process.env.PYTHON_WHATSAPP_ENDPOINT}/generate_qr`);
            socket.emit('whatsapp_qr', { 
              qrImage: qrResponse.data.qr_base64, 
              message: 'Please scan QR code' 
            });

            // Start polling for connection
            this.pollWhatsappConnection(socket);
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to check WhatsApp status' });
        }
      });
    });
  }

  private async pollWhatsappConnection(socket: any) {
    const checkInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${process.env.PYTHON_WHATSAPP_ENDPOINT}/connection_status`);
        
        if (response.data.connected) {
          this.whatsappConnected = true;
          socket.emit('whatsapp_status', { connected: true });
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error('Connection polling error', error);
      }
    }, 3000); // Check every 3 seconds
  }

  public getWhatsappConnectionStatus(): boolean {
    return this.whatsappConnected;
  }
}

export default WebSocketService;