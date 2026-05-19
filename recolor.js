/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(process.cwd(), 'public', 'icon'); 

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('❌ Unable to scan directory. Check the path: ' + err);
    } 
    
    let updatedCount = 0;

    files.forEach(function (file) {
        if(file.endsWith('.svg')) {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            let updatedContent = content
                .replace(/#000000/gi, '#FFFFFF')
                .replace(/#000\b/gi, '#FFFFFF')
                .replace(/fill="black"/gi, 'fill="#FFFFFF"')
                .replace(/stroke="black"/gi, 'stroke="#FFFFFF"');
            
            fs.writeFileSync(filePath, updatedContent);
            updatedCount++;
        }
    });
    console.log(`✅ Success! ${updatedCount} icons successfully recolored to white.`);
});