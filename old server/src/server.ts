import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import services and controllers
import WebSocketService from './services/webSocketService';
import TwilioService from './services/twilioService';
import WhatsappService from './services/whatsappService';
import EmailService from './services/emailService';
import MessageController from './controllers/messageController';
import WhatsappController from './controllers/whatsappController';

// Import routes
import messageRoutes from './routes/messageRoutes';
import whatsappRoutes from './routes/whatsappRoutes';

// Import utilities
import Logger from './utils/logger';

class Server {
  private app: express.Application;
  private server: http.Server;
  private webSocketService: WebSocketService;

  constructor() {
    // Load environment variables
    dotenv.config();

    // Initialize Express
    this.app = express();
    this.server = http.createServer(this.app);

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Initialize services
    this.initializeServices();

    // Setup routes
    this.setupRoutes();

    // Connect to database
    this.connectToDatabase();
  }

  private initializeServices() {
    // Initialize services with dependency injection
    const twilioService = new TwilioService();
    const whatsappService = new WhatsappService();
    const emailService = new EmailService();

    // Initialize WebSocket service
    this.webSocketService = new WebSocketService(this.server);

    // Initialize controllers with services
    const messageController = new MessageController(
      twilioService, 
      whatsappService, 
      this.webSocketService
    );

    const whatsappController = new WhatsappController(this.webSocketService);
  }

  private setupRoutes() {
    // Base route
    this.app.get('/', (req, res) => {
      res.json({ 
        status: 'Backend is running', 
        timestamp: new Date().toISOString() 
      });
    });

    // API routes
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/whatsapp', whatsappRoutes);
  }

  private connectToDatabase() {
    mongoose.connect(process.env.MONGODB_URI!, {
      // Recommended MongoDB connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      Logger.info('Connected to MongoDB successfully');
    })
    .catch((error) => {
      Logger.error('MongoDB connection error', error);
      process.exit(1);
    });
  }

  public start(port: number = 3000) {
    this.server.listen(port, () => {
      Logger.info(`Server running on port ${port}`);
      console.log(`Server running on port ${port}`);
    });
  }
}

// Instantiate and start the server
const server = new Server();
server.start();

export default server;