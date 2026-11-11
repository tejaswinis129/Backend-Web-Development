
'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const transporter = require('./email');

// Create worker to process email jobs
const worker = new Worker(
  'email',
  async (job) => {

    // Handle OTP email job
    if (job.name === 'otp') {
      const { to, otp } = job.data;

      await transporter.sendMail({
        to: to,
        subject: 'Email Verification OTP',
        text: `Your OTP verification code is ${otp}. It is valid for 10 minutes.`,
      });

      console.log(`OTP email sent successfully to ${to}`);
    }
  },
  {
    connection,
  }
);

// Log completed jobs
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

// Log failed jobs
worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});

module.exports = worker;
