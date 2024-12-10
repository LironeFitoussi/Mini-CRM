import { Request, Response } from 'express';
import axios from 'axios';
import WebSocketService from '../services/webSocketService';

class WhatsappController {
  private webSocketService: WebSocketService;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  async getConnectionStatus(req: Request, res: Response) {
    try {
      const status = this.webSocketService.getWhatsappConnectionStatus();
      res.json({ connected: status });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
  }

  async generateQRCode(req: Request, res: Response) {
    try {
      // Proxy request to Python Selenium endpoint
      const response = await axios.get(`${process.env.PYTHON_WHATSAPP_ENDPOINT}/generate_qr`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  }
}

export default WhatsappController;