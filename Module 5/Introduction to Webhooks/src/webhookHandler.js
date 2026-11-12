
'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  // Step 1: Verify HMAC signature
  const signature = req.headers['x-webhook-signature'];

  if (
    typeof signature !== 'string' ||
    !signature.startsWith('sha256=')
  ) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const received = signature.slice(7);

  if (!/^[0-9a-fA-F]{64}$/.test(received)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received, 'hex')
  );

  if (!valid) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  // Step 2: Parse body after verification
  const event = JSON.parse(req.body);

  // Step 3: Check duplicate event
  if (_processedIds.has(event.id)) {
    return res.status(200).json({
      status: 'already_processed'
    });
  }

  // Step 4: Mark event as processed
  _processedIds.add(event.id);

  // Step 5: Acknowledge immediately
  res.status(200).json({
    status: 'received'
  });

  // Step 6: Process event after response
  setImmediate(() => {
    handleEvent(event).catch(console.error);
  });
}

module.exports = { handleWebhook, _processedIds };
