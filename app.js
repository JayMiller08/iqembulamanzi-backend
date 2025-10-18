const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./src/routes/userRoutes');
const connectDB = require('./config/db');
const { MessagingResponse } = require('twilio').twiml;
const IncidentService = require('./src/services/incidentService');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 2000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging middleware
app.use(morgan('combined'));

// For Twilio webhook (raw body for signature validation, before other parsers)
app.use('/api/incidents/webhook', express.raw({ type: '*' }));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like HTML


// Routes
app.get('/', (req, res) => {
  console.log('Serving user form on refresh with status 200:', req.method, req.url); // Log page refresh in terminal
  res.status(200).sendFile(path.join(__dirname, 'public/user_form.html'));
});

const incidentRoutes = require('./src/routes/incidentRoutes');
app.use('/api/incidents', incidentRoutes);
app.use(userRoutes);

// Consolidated WhatsApp webhook handler
app.post('/whatsapp', async (req, res) => {
  try {
    console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));

    const body = req.body.Body || '';
    const reporterPhone = req.body.From ? req.body.From.replace('whatsapp:', '') : null;
    const hasLocation = req.body.Latitude && req.body.Longitude;
    const latitude = parseFloat(req.body.Latitude);
    const longitude = parseFloat(req.body.Longitude);

    if (!reporterPhone) {
      throw new Error('Missing sender phone');
    }

    const incidentService = new IncidentService();
    let twiml = new MessagingResponse();

    if (hasLocation && !isNaN(latitude) && !isNaN(longitude)) {
      console.log('Processing location share for phone:', reporterPhone);
      const openIncident = await incidentService.findOpenIncidentByReporter(reporterPhone);
      
      if (openIncident) {
        await incidentService.updateIncident(openIncident._id, {
          location: { type: 'Point', coordinates: [longitude, latitude] }
        });
        console.log('Updated location for existing incident:', openIncident._id);
        twiml.message('Location updated for your incident report!');
      } else {
        const { incident: savedIncident, isNew } = await incidentService.createIncident({
          description: body.trim() || 'User shared location without prior description',
          reporterPhone,
          category: 'other',
          location: { type: 'Point', coordinates: [longitude, latitude] }
        });
        console.log('Created new incident with location for phone:', reporterPhone);
        twiml.message(`Thanks for sharing your location! ${isNew ? 'An incident has been created (ID: ' + savedIncident._id + ').' : 'Added to existing incident (ID: ' + savedIncident._id + ').'} Please send a description for more details.`);
      }
    } else if (body.trim()) {
      console.log('Processing text message for phone:', reporterPhone);
      const { incident: savedIncident, isNew } = await incidentService.createIncident({
        description: body.trim(),
        reporterPhone,
        category: 'other',
        location: { type: 'Point', coordinates: [0, 0] }
      });
      twiml.message(isNew ? `Incident reported and saved (ID: ${savedIncident._id})! To add your location, tap the attachment icon and select "Location".` : `Your report added to existing incident (ID: ${savedIncident._id})! To add location, tap the attachment icon.`);
    } else {
      twiml.message('Hello! To report an incident, send a description of the problem. You can also share your location anytime.');
    }

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('Error processing WhatsApp incident:', error);
    const twiml = new MessagingResponse();
    twiml.message('Sorry, there was an error processing your message. Please try again.');
    res.type('text/xml').send(twiml.toString());
  }
});

// Catch-all handler for 404 (page not found)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
