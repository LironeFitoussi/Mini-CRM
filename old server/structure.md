├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── twilio.ts
│   │   └── nodemailer.ts
│   ├── controllers/
│   │   ├── messageController.ts
│   │   ├── whatsappController.ts
│   │   └── emailController.ts
│   ├── models/
│   │   ├── Message.ts
│   │   └── WhatsappSession.ts
│   ├── routes/
│   │   ├── messageRoutes.ts
│   │   ├── whatsappRoutes.ts
│   │   └── emailRoutes.ts
│   ├── services/
│   │   ├── twilioService.ts
│   │   ├── whatsappService.ts
│   │   ├── emailService.ts
│   │   └── webSocketService.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── errorHandler.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json