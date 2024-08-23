import { HealthCheckController } from './healthcheck.controller'
import { Test, TestingModule } from '@nestjs/testing'

describe('HealthcheckController', () => {
  let healthCheckController: HealthCheckController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController]
    }).compile()

    healthCheckController = module.get<HealthCheckController>(HealthCheckController)
  })

  it('should be defined', () => {
    expect(healthCheckController).toBeDefined()
  })

  describe('getHealthCheck', () => {
    it('should return online', () => {
      const result = healthCheckController.getHealthCheck()
      expect(result).toEqual({ message: 'online' })
    })
  })
})
