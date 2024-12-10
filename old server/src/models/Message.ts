import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  channel: 'sms' | 'whatsapp' | 'email';
  recipients: string[];
  content: string;
  status: 'pending' | 'sent' | 'failed';
  errorDetails?: string;
  sentAt?: Date;
  providerMessageId?: string;
}

const MessageSchema: Schema = new Schema({
  channel: { 
    type: String, 
    enum: ['sms', 'whatsapp', 'email'], 
    required: true 
  },
  recipients: [{ type: String, required: true }],
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'], 
    default: 'pending' 
  },
  errorDetails: { type: String },
  sentAt: { type: Date },
  providerMessageId: { type: String }
}, {
  timestamps: true
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;