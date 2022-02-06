'use strict'
import { BrokerOptions, Errors, LogLevels, MetricRegistry } from 'moleculer'

const brokerConfig: BrokerOptions = {
  namespace: '',
  nodeID: process.env.NODEID,
  metadata: {},
  transporter: process.env.TRANSPORTER || 'redis://localhost:6379',
  logger: {
    type: 'Console',
    options: {
      colors: true,
      moduleColors: true,
      formatter: 'full',
      objectPrinter: null,
      autoPadding: true,
    },
  },
  logLevel: (process.env.LOGLEVEL as LogLevels) || 'info',

  cacher: process.env.CACHER || 'Redis',
  serializer: 'JSON',
  requestTimeout: 10 * 1000,
  retryPolicy: {
    enabled: false,
    retries: 5,
    delay: 100,
    maxDelay: 1000,
    factor: 2,
    check: (err: Errors.MoleculerError) => err && !!err.retryable,
  },
  maxCallLevel: 100,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  contextParamsCloning: false,
  tracking: {
    enabled: false,
    shutdownTimeout: 5000,
  },
  disableBalancer: false,
  registry: {
    strategy: 'RoundRobin',
    preferLocal: true,
  },
  circuitBreaker: {
    enabled: false,
    threshold: 0.5,
    minRequestCount: 20,
    windowTime: 60,
    halfOpenTime: 10 * 1000,
    check: (err: Errors.MoleculerError) => err && err.code >= 500,
  },
  bulkhead: {
    enabled: false,
    concurrency: 10,
    maxQueueSize: 100,
  },
  validator: true,
  metrics: {
    enabled: false,
    reporter: {
      type: 'Console',
      options: {
        port: 3030,
        path: '/metrics',
        defaultLabels: (registry: MetricRegistry) => ({
          namespace: registry.broker.namespace,
          nodeID: registry.broker.nodeID,
        }),
      },
    },
  },
  tracing: {
    enabled: true,
    exporter: {
      type: 'Console',
      options: {
        logger: null,
        colors: true,
        width: 100,
        gaugeWidth: 40,
      },
    },
  },
  middlewares: [],

  async started(broker) {},

  stopped() {},
}

export default brokerConfig
