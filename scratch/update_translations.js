const fs = require('fs');
const path = require('path');

const kuPath = path.join(__dirname, '../messages/ku.json');
const enPath = path.join(__dirname, '../messages/en.json');

const errorsKu = {
  "requiredFields": "تکایە هەموو خانە پێویستەکان پڕ بکەرەوە.",
  "invalidNumber": "پارەکە دەبێت ژمارەیەکی دروست بێت.",
  "saveFailed": "نەتوانرا مامەڵەکە تۆمار بکرێت.",
  "generic": "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە.",
  "emailExists": "ئەم ئیمەیڵە پێشتر بەکارهاتووە.",
  "phoneExists": "ئەم ژمارە تەلەفۆنە پێشتر بەکارهاتووە.",
  "notFound": "نەدۆزرایەوە.",
  "deleteFailed": "نەتوانرا بسڕێتەوە.",
  "permissionDenied": "تۆ دەسەڵاتی ئەم کارەت نییە.",
  "insufficientStock": "بڕی پێویست لە کۆگادا نییە.",
  "success": "سەرکەوتوو بوو"
};

const errorsEn = {
  "requiredFields": "Please fill in all required fields.",
  "invalidNumber": "The amount must be a valid number.",
  "saveFailed": "The transaction could not be saved.",
  "generic": "An error occurred, please try again.",
  "emailExists": "This email is already in use.",
  "phoneExists": "This phone number is already in use.",
  "notFound": "Not found.",
  "deleteFailed": "Could not be deleted.",
  "permissionDenied": "You do not have permission to perform this action.",
  "insufficientStock": "Insufficient stock.",
  "success": "Success"
};

function updateTranslations(filePath, errorsObj) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.Errors = errorsObj;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${filePath}`);
}

updateTranslations(kuPath, errorsKu);
updateTranslations(enPath, errorsEn);
