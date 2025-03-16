import mongoose, {Schema} from 'mongoose';

// Camera Schema
const cameraSchema = new Schema({
  cameraId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  railwaySection: {
    type: String,
    required: true
  },
  nearestStation: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  powerSource: {
    type: String,
    enum: ['grid', 'solar', 'hybrid'],
    default: 'grid'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  installationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

cameraSchema.index({ location: '2dsphere' });

const stationSchema = new Schema({
  stationCode: {
    type: String,
    required: true,
    unique: true
  },
  stationName: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },
  contactNumber: {
    type: String
  },
  emergencyContact: {
    type: String
  }
}, { timestamps: true });

// Create a geospatial index on the location field
stationSchema.index({ location: '2dsphere' });

// Train Schema
const trainSchema = new Schema({
  trainNumber: {
    type: String,
    required: true,
    unique: true
  },
  trainName: {
    type: String,
    required: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  currentSpeed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'maintenance'],
    default: 'running'
  },
  driver: {
    name: String,
    contactNumber: String,
    id: String
  }
}, { timestamps: true });

// Animal Detection Event Schema
const detectionEventSchema = new Schema({
  camera: {
    type: Schema.Types.ObjectId,
    ref: 'Camera',
    required: true
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  animalType: {
    type: String,
    enum: ['elephant', 'deer', 'cattle', 'dog', 'cat', 'wild_boar', 'unknown', 'other'],
    default: 'unknown'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['detected', 'confirmed', 'false_positive', 'cleared'],
    default: 'detected'
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  actionsTaken: [{
    actionType: {
      type: String,
      enum: ['buzzer_activated', 'alert_sent', 'train_notified', 'speed_reduced', 'emergency_brake'],
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
}, { timestamps: true });

// Alert Schema
const alertSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'DetectionEvent',
    required: true
  },
  camera: {
    type: Schema.Types.ObjectId,
    ref: 'Camera',
    required: true
  },
  alertType: {
    type: String,
    enum: ['animal_detected', 'animal_persistent', 'train_approaching', 'speed_reduction', 'emergency'],
    required: true
  },
  alertSeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'active'
  },
  affectedTrains: [{
    type: Schema.Types.ObjectId,
    ref: 'Train'
  }],
  notifiedStations: [{
    type: Schema.Types.ObjectId,
    ref: 'Station'
  }],
  acknowledgedBy: {
    userId: String,
    userName: String,
    timestamp: Date
  },
  resolvedAt: Date,
  notes: String
}, { timestamps: true });

// Create models from schemas
const Camera = mongoose.models.Camera || mongoose.model('Camera', cameraSchema);
const Station = mongoose.models.Station || mongoose.model('Station', stationSchema);
const Train = mongoose.models.Train || mongoose.model('Train', trainSchema);
const DetectionEvent = mongoose.models.DetectionEvent || mongoose.model('DetectionEvent', detectionEventSchema);
const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);


export {
  Camera,
  Station,
  Train,
  DetectionEvent,
  Alert,
};