const { extractTextFromPdf } = require('../utils/pdfUtils');
const { generateRoadmap } = require('../services/roadmapService');
const Roadmap = require('../models/Roadmap');

const analyzePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const text = await extractTextFromPdf(req.file.buffer);

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'No readable text found in PDF' });
    }

    const roadmapJson = await generateRoadmap(text);


    roadmapJson.document = roadmapJson.document || {};
    roadmapJson.document.title = req.file.originalname;
    roadmapJson.document.source = 'upload';

    roadmapJson.createdBy = req.user?.id || null;
    roadmapJson.roomId = req.body.roomId || null;

    
    const saved = await Roadmap.create(roadmapJson);

   

    return res.json({ roadmap: saved });
  } catch (err) {
    console.error('analyzePdf error', err);
    return res.status(500).json({ error: 'Failed to analyze PDF' });
  }
};

module.exports = { analyzePdf };
