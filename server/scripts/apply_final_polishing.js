const fs = require('fs');
const path = require('path');

// 1. SoundscapeStudio.jsx
const soundPath = path.resolve('client/src/components/ui/SoundscapeStudio.jsx');
let soundContent = fs.readFileSync(soundPath, 'utf8');
soundContent = soundContent.replace(
  /aria-label="Soundscape Studio"/g,
  'aria-label={isPlayingLofi ? "Lo-Fi Active Soundscape Studio" : "Sound FX Studio"}'
);
fs.writeFileSync(soundPath, soundContent);
console.log('Fixed SoundscapeStudio.jsx aria-label');

// 2. ProjectCard.jsx
const cardPath = path.resolve('client/src/components/projects/ProjectCard.jsx');
let cardContent = fs.readFileSync(cardPath, 'utf8');
cardContent = cardContent.replace(
  /<img\s+src=\{imgSrc\}\s+alt=\{proj\.title\}\s+loading=\{indexNum === 1 \? "eager" : "lazy"\}\s+fetchPriority=\{indexNum === 1 \? "high" : "auto"\}\s+decoding=\{indexNum === 1 \? "sync" : "async"\}\s+width="600"\s+height="340"\s+style=\{\{ aspectRatio: "16\/9", objectFit: "cover" \}\}\s*\/>/,
  `<picture>
          {imgSrc && imgSrc.includes('airbnb-clone-preview') && (
            <source srcSet="/images/airbnb-clone-preview.webp" type="image/webp" />
          )}
          <img
            src={imgSrc}
            alt={proj.title}
            loading={indexNum === 1 ? "eager" : "lazy"}
            fetchPriority={indexNum === 1 ? "high" : "auto"}
            decoding={indexNum === 1 ? "sync" : "async"}
            width="600"
            height="340"
            style={{ aspectRatio: "16/9", objectFit: "cover" }}
          />
        </picture>`
);
fs.writeFileSync(cardPath, cardContent);
console.log('Fixed ProjectCard.jsx picture element');

