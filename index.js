const bunyan = require('bunyan')
const { EmailStream } = require('bunyan-emailstream')

module.exports = function createLogger ({ name, logLevel, ip, email }) {
  const streams = []
  streams.push({
    stream: process.stdout,
    level: logLevel
  })

  if (email && email.transport) {
    const emailStream = new EmailStream(
      {
        from: email.from || 'noreply@imbox.se',
        to: email.to || 'teknik@imbox.se'
      },
      email.transport
    )
    emailStream.formatSubject = formatSubject
    emailStream.formatBody = formatBody

    streams.push({
      type: 'raw',
      level: 'fatal',
      stream: emailStream
    })
  }

  const opts = {
    name: name,
    streams: streams,
    serializers: bunyan.stdSerializers
  }
  if (ip) {
    opts.ip = ip
  }
  return bunyan.createLogger(opts)
}

function formatSubject ({ level, name, pid, hostname, ip }) {
  return `[${LEVELS[level]}] ${name}/${pid} on ${hostname}${
    ip ? '/' + ip : ''
  }`
}

function formatBody ({ name, hostname, pid, time, ip, msg, err }) {
  var rows = []
  rows.push('* name: ' + name)
  rows.push('* hostname: ' + hostname)
  rows.push('* pid: ' + pid)
  rows.push('* time: ' + time)

  if (ip) {
    rows.push('* ip: ' + ip)
  }
  if (msg) {
    rows.push('* msg: ' + msg)
  }
  if (err) {
    rows.push('* err.stack: ' + err.stack)
  }

  return rows.join('\n')
}

// Levels
var LEVELS = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL'
}
