import { 
  FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiStar, 
  FiAward, FiAlertCircle, FiCheckCircle, FiClock, FiGlobe,
  FiHome, FiTruck, FiActivity, FiInfo, FiMessageCircle,
  FiTrash2, FiX, FiFilter, FiSearch, FiDownload, FiEdit2,
  FiRefreshCw, FiPhone, FiVideo, FiCheck, FiSmile, FiHand
} from 'react-icons/fi';
import { BsRecord2Fill } from 'react-icons/bs';

// Map emoji characters to icon components
export const emojiToIcon = (emoji, className = "") => {
  const iconProps = { className, size: 18 };
  
  switch(emoji) {
    case '📅': return <FiCalendar {...iconProps} />;
    case '📍': return <FiMapPin {...iconProps} />;
    case '👥': return <FiUsers {...iconProps} />;
    case '💰': return <FiDollarSign {...iconProps} />;
    case '⭐': return <FiStar {...iconProps} />;
    case '🏆': return <FiAward {...iconProps} />;
    case '⚠️': return <FiAlertCircle {...iconProps} />;
    case '✅': return <FiCheckCircle {...iconProps} />;
    case '🔴': return <BsRecord2Fill {...iconProps} color="red" />;
    case '⏰': return <FiClock {...iconProps} />;
    case '🌍': return <FiGlobe {...iconProps} />;
    case '🏠': return <FiHome {...iconProps} />;
    case '🚗': return <FiTruck {...iconProps} />;
    case '🎯': return <FiActivity {...iconProps} />;
    case '📊': return <FiInfo {...iconProps} />;
    case '💬': return <FiMessageCircle {...iconProps} />;
    case '🔍': return <FiSearch {...iconProps} />;
    case '🗑️': return <FiTrash2 {...iconProps} />;
    case '🔄': return <FiRefreshCw {...iconProps} />;
    case '❌': return <FiX {...iconProps} />;
    case '📱': return <FiPhone {...iconProps} />;
    case '🎥': return <FiVideo {...iconProps} />;
    case '✓': return <FiCheck {...iconProps} />;
    case '🎒': return <FiActivity {...iconProps} />; // For backpack/join trip
    case '🚫': return <FiX {...iconProps} />; // For prohibited/full
    case '🎉': return <FiActivity {...iconProps} />; // For celebration
    case '😊': return <FiSmile {...iconProps} />; // For smile
    case '👋': return <FiHand {...iconProps} />; // For wave/hello
    default: return null; // Return null to completely remove emojis
  }
};

// Function to replace emoji text in strings
export const replaceEmojiInText = (text) => {
  if (!text) return text;
  
  // Common emoji patterns to replace
  const emojiReplacements = {
    '📅': '',
    '📍': '',
    '👥': '',
    '💰': '',
    '⭐': '',
    '🏆': '',
    '⚠️': '',
    '✅': '',
    '🔴': '',
    '⏰': '',
    '🌍': '',
    '🏠': '',
    '🚗': '',
    '🎯': '',
    '📊': '',
    '💬': '',
    '🔍': '',
    '🗑️': '',
    '🔄': '',
    '❌': '',
    '📱': '',
    '🎥': '',
    '✓': '',
    '🚨': '',
    '🧪': '',
    '🎒': '',
    '🚫': '',
    '🎉': '',
    '😊': '',
    '👋': ''
  };
  
  // Replace all emojis in the text
  let result = text;
  Object.keys(emojiReplacements).forEach(emoji => {
    result = result.replace(new RegExp(emoji, 'g'), emojiReplacements[emoji]);
  });
  
  return result;
};




