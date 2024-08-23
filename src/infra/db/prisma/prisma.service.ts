/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable, type OnModuleInit, type OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient, type Prisma } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' }
      ],
      transactionOptions: {
        timeout: 60000,
        maxWait: 12000
      }
    })

    this.setupEventHandlers()
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Connected to the database')
    } catch (error) {
      this.logger.error('Failed to connect to the database:', error)
      this.handleDatabaseConnectionError(error)
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect()
      this.logger.log('Disconnected from the database')
    } catch (error) {
      this.logger.error('Failed to disconnect from the database:', error)
    }
  }

  private setupEventHandlers() {
    // @ts-expect-error
    this.$on('query', (event: Prisma.QueryEvent) => {
      this.handleQueryEvent(event)
    })
    // @ts-expect-error
    this.$on('info', (event: Prisma.LogEvent) => {
      this.handleInfoEvent(event)
    })
    // @ts-expect-error
    this.$on('warn', (event: Prisma.LogEvent) => {
      this.handleWarnEvent(event)
    })
    // @ts-expect-error
    this.$on('error', (event: Prisma.LogEvent) => {
      this.handleErrorEvent(event)
    })
  }

  private handleQueryEvent(event: Prisma.QueryEvent): void {
    if (event.query && event.params) {
      this.logger.debug(`Query: ${event.query} ${event.params}`)
    } else {
      this.logger.debug('Unexpected query event structure.')
    }
  }

  private handleInfoEvent(event: Prisma.LogEvent): void {
    if (event.message) {
      this.logger.log(`Info: ${event.message}`)
    } else {
      this.logger.log('Unexpected info event structure.')
    }
  }

  private handleWarnEvent(event: Prisma.LogEvent): void {
    if (event.message) {
      this.logger.warn(`Warning: ${event.message}`)
    } else {
      this.logger.warn('Unexpected warn event structure.')
    }
  }

  private handleErrorEvent(event: Prisma.LogEvent): void {
    if (event.message) {
      this.logger.error(`Error: ${event.message}`)
    } else {
      this.logger.error('Unexpected error event structure.')
    }
  }

  private handleDatabaseConnectionError(error: any): void {
    // Implement reconnection logic or error handling here
    this.logger.error('Database connection error:', error.message)
    // Optionally, retry the connection after a delay or implement a notification system
  }
}
