#!/usr/bin/env node

/**
 * Script to check available Gemini models for your API key
 * Usage: node check-gemini-models.js YOUR_API_KEY
 */

const https = require('https');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ Error: Please provide your Gemini API key');
  console.log('Usage: node check-gemini-models.js YOUR_API_KEY');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('🔍 Checking available Gemini models for your API key...\n');

https
  .get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          const models = response.models || [];

          if (models.length === 0) {
            console.log('⚠️  No models found. Check your API key and billing status.');
            return;
          }

          console.log(`✅ Found ${models.length} available model(s):\n`);

          // Filter and display models that support generateContent
          const generateContentModels = models.filter((model) =>
            model.supportedGenerationMethods?.includes('generateContent'),
          );

          if (generateContentModels.length > 0) {
            console.log('📝 Models supporting generateContent:\n');
            generateContentModels.forEach((model) => {
              console.log(`   ✅ ${model.name}`);
              if (model.displayName) {
                console.log(`      Display Name: ${model.displayName}`);
              }
              if (model.description) {
                console.log(`      Description: ${model.description}`);
              }
              console.log('');
            });

            // Recommend best models
            console.log('\n💡 Recommended models (in order of preference):\n');
            const recommendations = [
              'gemini-2.5-flash',
              'gemini-flash-latest',
              'gemini-pro',
              'gemini-1.5-pro',
              'gemini-1.5-flash',
            ];

            recommendations.forEach((rec) => {
              const found = generateContentModels.find((m) =>
                m.name.includes(rec.replace('gemini-', '')),
              );
              if (found) {
                console.log(`   ✅ ${rec} - Available`);
              } else {
                console.log(`   ❌ ${rec} - Not available`);
              }
            });
          } else {
            console.log('⚠️  No models found that support generateContent.');
          }

          // Show all models
          console.log('\n📋 All available models:\n');
          models.forEach((model) => {
            console.log(`   - ${model.name}`);
          });
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error(`❌ Error: HTTP ${res.statusCode}`);
        try {
          const error = JSON.parse(data);
          console.error('Error details:', error.error?.message || error);
        } catch (e) {
          console.error('Response:', data);
        }
      }
    });
  })
  .on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });
