import express from 'express';
import WhatsappController from '../controllers/whatsappController';

class WhatsappRoutes {
  public router: express.Router;
  private whatsappController: WhatsappController;

  constructor(whatsappController: WhatsappController) {
    this.router = express.Router();
    this.whatsappController = whatsappController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get current WhatsApp connection status
    this.router.get('/status', (req, res) => 
      this.whatsappController.getConnectionStatus(req, res)
    );

    // Trigger QR code generation
    this.router.get('/generate-qr', (req, res) => 
      this.whatsappController.generateQRCode(req, res)
    );
  }
}

export default WhatsappRoutes;