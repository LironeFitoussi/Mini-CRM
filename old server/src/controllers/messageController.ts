import { Request, Response } from 'express';
import TwilioService from '../services/twilioService';
import WhatsappService from '../services/whatsappService';
import WebSocketService from '../services/webSocketService';

class MessageController {
  private twilioService: TwilioService;
  private whatsappService: WhatsappService;
  private webSocketService: WebSocketService;

  constructor(
    twilioService: TwilioService, 
    whatsappService: WhatsappService,
    webSocketService: WebSocketService
  ) {
    this.twilioService = twilioService;
    this.whatsappService = whatsappService;
    this.webSocketService = webSocketService;
  }

  async sendMessage(req: Request, res: Response) {
    const { phoneNumbers, message, channel } = req.body;

    // Check WhatsApp connection if channel is WhatsApp
    if (channel === 'whatsapp' && !this.webSocketService.getWhatsappConnectionStatus()) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
      let results;
      if (channel === 'sms') {
        results = await this.twilioService.sendSMS(phoneNumbers, message);
      } else if (channel === 'whatsapp') {
        results = await this.whatsappService.sendWhatsappMessage(phoneNumbers, message);
      } else {
        return res.status(400).json({ error: 'Invalid channel' });
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Message sending failed' });
    }
  }

  async broadcastMessage(req: Request, res: Response) {
    const { phoneNumbers, message, channel } = req.body;

    try {
      let results;
      if (channel === 'sms') {
        results = await Promise.all(
          phoneNumbers.map(number => 
            this.twilioService.sendSMS(number, message)
          )
        );
      } else if (channel === 'whatsapp') {
        results = await Promise.all(
          phoneNumbers.map(number => 
            this.whatsappService.sendWhatsappMessage(number, message)
          )
        );
      } else {
        return res.status(400).json({ error: 'Invalid channel' });
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ error: 'Broadcast failed' });
    }
  }
}

export default MessageController;