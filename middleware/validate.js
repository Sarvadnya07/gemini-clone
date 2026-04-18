// middleware/validate.js — Input sanitization & strict validation
const MAX_PROMPT_LENGTH = 10000;
const MAX_ATTACHMENT_SIZE_BASE64 = Math.ceil((5 * 1024 * 1024 * 4) / 3); // 5MB in base64

const validateChatInput = (req, res, next) => {
  const { prompt, image, attachments } = req.body;

  // Validate prompt
  if (prompt !== undefined) {
    if (typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt must be a string.' });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        error: `Prompt exceeds max length of ${MAX_PROMPT_LENGTH} characters.`,
      });
    }
    // Sanitize: strip null bytes and dangerous unicode
    req.body.prompt = prompt.replace(/\0/g, '').trim();
  }

  // Validate attachments array
  const attList = image || attachments;
  if (attList) {
    if (!Array.isArray(attList)) {
      return res.status(400).json({ error: 'Attachments must be an array.' });
    }
    if (attList.length > 5) {
      return res.status(400).json({ error: 'Maximum of 5 attachments allowed.' });
    }
    for (const att of attList) {
      if (att.data && att.data.length > MAX_ATTACHMENT_SIZE_BASE64) {
        return res.status(400).json({ error: `Attachment "${att.name}" exceeds 5MB limit.` });
      }
    }
  }

  next();
};

module.exports = { validateChatInput };
