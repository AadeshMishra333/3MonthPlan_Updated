// ==========================================
// DIVYA CHETNA - CHAT WIDGET (AI-Powered)
// ==========================================

const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatBadge = document.getElementById('chatBadge');
const chatMinimize = document.getElementById('chatMinimize');

let isOpen = false;
let conversationHistory = [];

// Intitial system context
const systemPrompt = `तुम दिव्य चेतना श्री रामकथा चैरिटेबल ट्रस्ट के सहायक हो। तुम्हारा नाम "रामसेवक" है।

ट्रस्ट की जानकारी:
- संगठन: दिव्य चेतना श्री रामकथा चैरिटेबल ट्रस्ट
- वेबसाइट: www.divyachetna.in
- आगामी आयोजन: श्री रामकथा महोत्सव 2025
- तारीख: 1 सितंबर से 7 सितंबर 2025
- स्थान: पैलेस ग्राउंड, गेट 9, बेंगलुरु, कर्नाटक
- समय: प्रतिदिन सुबह 9 बजे से रात 9 बजे तक
- प्रवेश: निःशुल्क (पंजीकरण अनिवार्य)
- संपर्क: info@divyachetna.in | +91 98765 43210

पंजीकरण: वेबसाइट पर ऑनलाइन फॉर्म भरें, QR टिकट मिलेगा
सेवा दल: स्वयंसेवक बन सकते हैं, सेवा पृष्ठ पर जाएं
विशेष व्यवस्था: रहने की, भोजन (प्रसाद) की व्यवस्था उपलब्ध

हमेशा हिंदी में उत्तर दो, विनम्र और भक्तिपूर्ण भाव से।
उत्तर संक्षिप्त रखो (2-3 वाक्य)।
"जय श्री राम" या "🙏" का उपयोग करो।
अगर कोई सवाल का जवाब नहीं पता तो कहो "अधिक जानकारी के लिए info@divyachetna.in पर संपर्क करें।"`;

function toggleChat() {
  isOpen = !isOpen;
  chatBox.classList.toggle('open', isOpen);
  
  const chatIcon = chatToggle.querySelector('.chat-icon');
  const closeIcon = chatToggle.querySelector('.chat-close-icon');
  chatIcon.style.display = isOpen ? 'none' : 'flex';
  closeIcon.style.display = isOpen ? 'flex' : 'none';
  
  if (isOpen && chatBadge) {
    chatBadge.style.display = 'none';
  }
  
  if (isOpen) chatInput.focus();
}

chatToggle.addEventListener('click', toggleChat);
if (chatMinimize) chatMinimize.addEventListener('click', toggleChat);

function getTime() {
  return new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, type, isHTML = false) {
  const quickBtns = document.getElementById('quickBtns');
  if (quickBtns) quickBtns.remove();

  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHTML) bubble.innerHTML = text;
  else bubble.textContent = text;

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();

  msg.appendChild(bubble);
  msg.appendChild(time);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

async function getBotResponse(userMsg) {
  conversationHistory.push({ role: 'user', content: userMsg });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: conversationHistory
      })
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const botReply = data.content[0]?.text || 'क्षमा करें, कोई त्रुटि हुई।';

    conversationHistory.push({ role: 'assistant', content: botReply });
    return botReply;

  } catch (err) {
    // Fallback responses
    const fallbacks = {
      'पंजीकरण': '📝 पंजीकरण के लिए हमारे "पंजीकरण" पृष्ठ पर जाएं। वहाँ फॉर्म भरें और आपको QR कोड सहित टिकट मिलेगा। प्रवेश निःशुल्क है। 🙏',
      'आयोजन': '📅 श्री रामकथा महोत्सव 2025: 1-7 सितंबर, पैलेस ग्राउंड गेट 9, बेंगलुरु। प्रतिदिन सुबह 9 से रात 9 बजे तक। जय श्री राम! 🙏',
      'स्थान': '📍 पैलेस ग्राउंड, गेट नंबर 9, बेंगलुरु, कर्नाटक। मेट्रो: केम्पेगौड़ा स्टेशन से ऑटो/बस द्वारा आसानी से पहुँचें। 🙏',
      'सेवा': '🤝 सेवा दल में जुड़ने के लिए हमारे "सेवा" पृष्ठ पर जाएं। विभिन्न सेवाएं उपलब्ध हैं — स्वागत, प्रसाद, व्यवस्था आदि। जय श्री राम! 🙏',
      'संपर्क': '📞 संपर्क: +91 98765 43210 | ✉️ info@divyachetna.in | WhatsApp पर भी संपर्क कर सकते हैं। 🙏',
      'प्रसाद': '🍛 प्रतिदिन प्रसाद वितरण होगा। भंडारे की व्यवस्था उपलब्ध है। आएं और राम जी का प्रसाद पाएं। जय श्री राम! 🙏',
    };

    for (const [key, val] of Object.entries(fallbacks)) {
      if (userMsg.includes(key)) return val;
    }

    return '🙏 जय श्री राम! आपके सवाल के लिए धन्यवाद। अधिक जानकारी के लिए info@divyachetna.in पर संपर्क करें या +91 98765 43210 पर कॉल करें।';
  }
}

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  chatInput.value = '';
  addMessage(msg, 'user');
  showTyping();

  const response = await getBotResponse(msg);
  removeTyping();
  addMessage(response, 'bot');
}

window.sendQuick = function(msg) {
  chatInput.value = msg;
  sendMessage();
};

// Enter key
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Show badge after delay
setTimeout(() => {
  if (!isOpen && chatBadge) {
    chatBadge.style.display = 'flex';
    chatBadge.textContent = '1';
  }
}, 3000);
