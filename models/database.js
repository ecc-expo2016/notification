'use strict';
import mongoose, {Schema} from 'mongoose';

mongoose.connect(process.env.MONGOLAB_URI);

const creatorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 1
  }
});

const workSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  creators: [creatorSchema],
  created: {
    type: Date,
    default: Date.now
  },
  modified: {
    type: Date,
    default: Date.now
  }
});

export const Work = mongoose.model('Work', workSchema);
