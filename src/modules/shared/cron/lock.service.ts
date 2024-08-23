import { Injectable } from '@nestjs/common'

@Injectable()
export class CronLockService {
  private locks: Record<string, boolean> = {}

  acquireLock(jobName: string): boolean {
    if (this.locks[jobName]) {
      return false
    }
    this.locks[jobName] = true
    return true
  }

  releaseLock(jobName: string): void {
    this.locks[jobName] = false
  }
}
