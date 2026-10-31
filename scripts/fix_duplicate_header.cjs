const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../client/src/components/layout/Header.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace duplicate liveTime definition
const duplicateTarget = `  const [liveTime, setLiveTime] = useState('');
  const toolsMenuRef = useRef(null);
  const accentPickerRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setLiveTime(\`\${hours}:\${minutes} IST\`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);`;

const replacement = `  const toolsMenuRef = useRef(null);
  const accentPickerRef = useRef(null);`;

// Handle possible CRLF or LF
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = duplicateTarget.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(file, result, 'utf8');
  console.log('Fixed duplicate liveTime in Header.jsx successfully');
} else {
  console.log('Target not found for duplicate liveTime');
}
