// Script to download face-api.js models
const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const MODEL_DIR = path.join(__dirname, 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

// List of required model files
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2'
];

// Download a single file
function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = MODEL_URL + filename;
    const dest = path.join(MODEL_DIR, filename);

    // Check if file already exists
    if (fs.existsSync(dest)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Download all models
async function downloadAllModels() {
  console.log('📦 Downloading face-api.js models...\n');

  try {
    for (const model of models) {
      await downloadFile(model);
    }
    console.log('\n✅ All models downloaded successfully!');
    console.log(`📁 Models location: ${MODEL_DIR}`);
  } catch (error) {
    console.error('\n❌ Error downloading models:', error.message);
    process.exit(1);
  }
}

downloadAllModels();
